const express = require('express');
const { google } = require('googleapis');
const playlistStore = require('../playlistStore');
const { refreshAccessToken } = require('../auth');

function createGoogleDocsRouter(songs) {
  const router = express.Router();

  function resolveSongs(sectionSongs) {
    return sectionSongs.map(entry => {
      const master = songs.find(s => s.id === entry.id);
      if (!master) return { id: entry.id, notFound: true };
      return {
        ...master,
        key: entry.key ?? master.key,
        tempo: entry.tempo ?? master.tempo,
        notes: entry.notes ?? master.notes,
      };
    });
  }

  function buildDocRequests(playlist) {
    const segments = [];

    segments.push({ text: playlist.name + '\n', namedStyle: 'HEADING_1' });

    if (playlist.date) {
      segments.push({ text: `Date: ${playlist.date}\n` });
    }
    if (playlist.theme) {
      segments.push({ text: `Theme: ${playlist.theme}\n` });
    }
    if (playlist.bibleLessons) {
      segments.push({ text: `Bible Lessons: ${playlist.bibleLessons}\n` });
    }
    segments.push({ text: '\n' });

    for (const section of playlist.sections) {
      const resolvedSongs = (section.songs || []).filter(s => !s.notFound);
      segments.push({ text: section.name + '\n', namedStyle: 'HEADING_2' });

      for (const song of resolvedSongs) {
        segments.push({ text: (song.title || 'Untitled') + '\n', namedStyle: 'HEADING_3' });

        const metaParts = [];
        if (song.key) metaParts.push(`Key: ${song.key}`);
        if (song.tempo) metaParts.push(`Tempo: ${song.tempo}`);
        if (metaParts.length > 0) {
          segments.push({ text: metaParts.join(' | ') + '\n' });
        }
        if (song.notes) {
          segments.push({ text: `Notes: ${song.notes}\n` });
        }

        if (song.lyrics) {
          song.lyrics.forEach((lyricSection, i) => {
            if (i > 0) segments.push({ text: '\n' }); // blank line between verses/choruses
            segments.push({ text: lyricSection.lines.join('\n') + '\n' });
          });
        }

        segments.push({ text: '___\n' });
      }
    }

    // Calculate index ranges for each segment
    let currentIndex = 1; // Docs content starts at index 1
    const segmentRanges = [];
    let fullText = '';

    for (const seg of segments) {
      const start = currentIndex;
      const end = currentIndex + seg.text.length;
      segmentRanges.push({ ...seg, startIndex: start, endIndex: end });
      fullText += seg.text;
      currentIndex = end;
    }

    const totalEnd = currentIndex; // exclusive end index covering all inserted text

    const requests = [
      {
        insertText: {
          location: { index: 1 },
          text: fullText,
        },
      },
    ];

    // Apply named styles for headings
    for (const seg of segmentRanges) {
      if (seg.namedStyle) {
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: seg.startIndex,
              endIndex: seg.endIndex - 1, // exclude trailing newline
            },
            paragraphStyle: {
              namedStyleType: seg.namedStyle,
            },
            fields: 'namedStyleType',
          },
        });
      }
    }

    // Apply Lexend font to all text (after heading styles so it takes effect)
    requests.push({
      updateTextStyle: {
        range: { startIndex: 1, endIndex: totalEnd },
        textStyle: {
          weightedFontFamily: { fontFamily: 'Lexend', weight: 400 },
        },
        fields: 'weightedFontFamily',
      },
    });

    return requests;
  }

  // POST /api/playlists/:id/google-doc
  router.post('/playlists/:id/google-doc', async (req, res) => {
    const playlist = playlistStore.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const session = req.session;
    if (!session || !session.accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      await refreshAccessToken(session);
    } catch (err) {
      console.error('Token refresh error:', err);
      return res.status(401).json({ error: 'Failed to refresh auth token. Please sign out and sign in again.' });
    }

    // Build resolved playlist
    const resolved = {
      ...playlist,
      sections: playlist.sections.map(section => ({
        ...section,
        songs: resolveSongs(section.songs || []),
      })),
    };

    const authClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    authClient.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const docs = google.docs({ version: 'v1', auth: authClient });
    const drive = google.drive({ version: 'v3', auth: authClient });

    try {
      // Create blank doc
      const createRes = await docs.documents.create({
        requestBody: { title: playlist.name },
      });
      const documentId = createRes.data.documentId;

      // Build and apply content
      const requests = buildDocRequests(resolved);
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests },
      });

      // Share: anyone with link can view
      await drive.permissions.create({
        fileId: documentId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;

      // Save to playlist
      playlistStore.update(req.params.id, { googleDoc: docUrl });

      res.json({ docUrl });
    } catch (err) {
      console.error('Google Doc creation error:', err);
      res.status(500).json({ error: 'Failed to create Google Doc. Check server logs.' });
    }
  });

  return router;
}

module.exports = { createGoogleDocsRouter };
