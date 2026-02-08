const fs = require('fs');
const path = require('path');

const METADATA_FIELDS = ['title', 'artist', 'key', 'tempo'];

function parseSongFile(filePath) {
  const filename = path.basename(filePath, '.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseSongContent(filename, content);
}

function parseSongContent(id, content) {
  const lines = content.split(/\r?\n/);

  // Parse metadata from header lines (before first blank line)
  const metadata = { id, title: null, artist: null, key: null, tempo: null };
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') break;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const field = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();
    if (METADATA_FIELDS.includes(field)) {
      metadata[field] = value || null;
    }
  }

  // Skip blank lines between metadata and lyrics
  while (i < lines.length && lines[i].trim() === '') i++;

  // Parse lyrics sections
  // Section labels (e.g. "Verse 1:") are optional.
  // Blank lines act as section delimiters.
  const lyrics = [];
  let sectionCount = 0;
  let currentSection = null;
  let currentLines = [];

  for (; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      // Blank line — flush current section if any
      if (currentLines.length > 0) {
        sectionCount++;
        lyrics.push({
          section: currentSection || `Section ${sectionCount}`,
          lines: currentLines,
        });
        currentSection = null;
        currentLines = [];
      }
      continue;
    }

    // Check if line is a section label (ends with ":" and no lyric content yet in this section)
    if (trimmed.endsWith(':') && !trimmed.includes('\t') && currentLines.length === 0) {
      currentSection = trimmed.slice(0, -1); // remove trailing ":"
      continue;
    }

    // Regular lyric line
    currentLines.push(trimmed);
  }

  // Flush last section
  if (currentLines.length > 0) {
    sectionCount++;
    lyrics.push({
      section: currentSection || `Section ${sectionCount}`,
      lines: currentLines,
    });
  }

  return { ...metadata, lyrics };
}

function loadAllSongs(songsDir) {
  const files = fs.readdirSync(songsDir);
  return files
    .filter(f => path.extname(f) === '.txt')
    .map(f => parseSongFile(path.join(songsDir, f)));
}

module.exports = { parseSongFile, parseSongContent, loadAllSongs };
