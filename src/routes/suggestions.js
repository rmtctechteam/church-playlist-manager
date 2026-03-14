const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const playlistStore = require('../playlistStore');
const analyticsDb = require('../analyticsDb');

function createSuggestionsRouter(songs) {
  const router = express.Router();

  // GET /api/config/features — feature flag for frontend
  router.get('/config/features', (req, res) => {
    res.json({
      songSuggestions: !!process.env.ANTHROPIC_API_KEY,
    });
  });

  // POST /api/playlists/:id/suggestions
  router.post('/playlists/:id/suggestions', async (req, res) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'Song suggestions are not available. ANTHROPIC_API_KEY is not configured.' });
    }

    const playlist = playlistStore.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Accept theme/lessons from request body (e.g. freshly looked up but not yet saved)
    // falling back to what's stored in the playlist
    const theme = req.body.theme || playlist.theme;
    const bibleLessons = req.body.bibleLessons || playlist.bibleLessons;

    if (!theme && !bibleLessons) {
      return res.status(400).json({ error: 'No theme or Bible lessons available. Run the lectionary lookup first.' });
    }

    // Build compact song context: title, artist, first lyric line
    const songContext = songs.map(song => {
      let firstLine = '';
      if (song.lyrics && song.lyrics.length > 0) {
        for (const section of song.lyrics) {
          const line = (section.lines || []).find(l => l.trim());
          if (line) { firstLine = line.trim(); break; }
        }
      }
      return {
        id: song.id,
        title: song.title || song.id,
        artist: song.artist || null,
        firstLine,
      };
    });

    // Build service sections list for context
    const sectionNames = (playlist.sections || []).map(s => s.name).filter(Boolean);

    const prompt = `You are helping a worship team select songs for a church service.

Service details:
- Theme: ${theme || '(not set)'}
- Bible Passages: ${bibleLessons || '(not set)'}
- Service Sections: ${sectionNames.join(', ') || '(not set)'}

Here is the full song library (${songContext.length} songs):
${songContext.map(s => `- id: "${s.id}" | title: "${s.title}"${s.artist ? ` | artist: "${s.artist}"` : ''} | first line: "${s.firstLine || ''}"`).join('\n')}

Please suggest 8–12 songs from the library above that best fit the service theme and Bible passages. Only suggest songs from the list above — do not invent songs.

For each suggestion, indicate which service section it best fits (choose from: ${sectionNames.length > 0 ? sectionNames.join(', ') : 'Opening, Worship, Closing'}).

Respond with ONLY a valid JSON array, no markdown, no explanation outside the array:
[
  {
    "songId": "<id from the list>",
    "title": "<title from the list>",
    "reason": "<1-2 sentence explanation of why this song fits>",
    "section": "<suggested service section>"
  }
]`;

    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0]?.text || '';

      // Parse JSON — strip any accidental markdown fences
      const cleaned = responseText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      const suggestions = JSON.parse(cleaned);

      // Enrich with last-performed date from analytics
      const usageSummary = analyticsDb.getUsageSummary();
      const enriched = suggestions.map(s => ({
        ...s,
        lastUsed: usageSummary[s.songId]?.lastUsed || null,
      }));

      return res.json({ suggestions: enriched, theme });
    } catch (err) {
      console.error('Song suggestions error:', err);
      return res.status(502).json({ error: 'Failed to get song suggestions. Please try again.' });
    }
  });

  return router;
}

module.exports = { createSuggestionsRouter };
