const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { parseSongContent, loadAllSongs } = require('../src/songParser');

describe('parseSongContent', () => {
  it('parses a well-formed song file', () => {
    const content = [
      'Title: Amazing Grace',
      'Artist: John Newton',
      'Key: G',
      'Tempo: 80 BPM',
      '',
      'Verse 1:',
      'Amazing grace how sweet the sound',
      'That saved a wretch like me',
      '',
      'Verse 2:',
      'Twas grace that taught my heart to fear',
      'And grace my fears relieved',
    ].join('\n');

    const song = parseSongContent('amazing-grace', content);

    assert.equal(song.id, 'amazing-grace');
    assert.equal(song.title, 'Amazing Grace');
    assert.equal(song.artist, 'John Newton');
    assert.equal(song.key, 'G');
    assert.equal(song.tempo, '80 BPM');
    assert.equal(song.lyrics.length, 2);
    assert.equal(song.lyrics[0].section, 'Verse 1');
    assert.deepEqual(song.lyrics[0].lines, [
      'Amazing grace how sweet the sound',
      'That saved a wretch like me',
    ]);
    assert.equal(song.lyrics[1].section, 'Verse 2');
    assert.deepEqual(song.lyrics[1].lines, [
      'Twas grace that taught my heart to fear',
      'And grace my fears relieved',
    ]);
  });

  it('handles missing optional metadata fields', () => {
    const content = [
      'Title: Simple Song',
      'Artist: Someone',
      '',
      'Verse 1:',
      'Some lyrics here',
    ].join('\n');

    const song = parseSongContent('simple-song', content);

    assert.equal(song.title, 'Simple Song');
    assert.equal(song.artist, 'Someone');
    assert.equal(song.key, null);
    assert.equal(song.tempo, null);
    assert.equal(song.notes, null);
    assert.equal(song.lyrics.length, 1);
  });

  it('parses Notes metadata field when present', () => {
    const content = [
      'Title: Amazing Grace',
      'Artist: John Newton',
      'Key: G',
      'Notes: Capo 2, play in G',
      '',
      'Verse 1:',
      'Amazing grace how sweet the sound',
    ].join('\n');

    const song = parseSongContent('amazing-grace', content);

    assert.equal(song.notes, 'Capo 2, play in G');
  });

  it('returns null for notes when Notes field is absent', () => {
    const content = [
      'Title: Simple Song',
      'Key: C',
      '',
      'Verse 1:',
      'Some lyrics here',
    ].join('\n');

    const song = parseSongContent('simple-song', content);

    assert.equal(song.notes, null);
  });

  it('parses multiple labeled sections with blank line separators', () => {
    const content = [
      'Title: Multi Section',
      'Artist: Test',
      'Key: C',
      'Tempo: 120 BPM',
      '',
      'Verse 1:',
      'First verse line 1',
      'First verse line 2',
      '',
      'Chorus:',
      'Chorus line 1',
      '',
      'Verse 2:',
      'Second verse line 1',
    ].join('\n');

    const song = parseSongContent('multi-section', content);

    assert.equal(song.lyrics.length, 3);
    assert.equal(song.lyrics[0].section, 'Verse 1');
    assert.equal(song.lyrics[1].section, 'Chorus');
    assert.equal(song.lyrics[2].section, 'Verse 2');
  });

  it('parses sections without labels using blank lines as delimiters', () => {
    const content = [
      'Title: The Blessing.pro',
      '',
      'The Lord bless you and keep you',
      'Make His face shine upon you',
      '',
      'Amen Amen Amen',
      'Amen Amen Amen',
      '',
      'May His favor be upon you',
      'And a thousand generations',
    ].join('\n');

    const song = parseSongContent('the-blessing', content);

    assert.equal(song.title, 'The Blessing.pro');
    assert.equal(song.lyrics.length, 3);
    assert.equal(song.lyrics[0].section, 'Section 1');
    assert.deepEqual(song.lyrics[0].lines, [
      'The Lord bless you and keep you',
      'Make His face shine upon you',
    ]);
    assert.equal(song.lyrics[1].section, 'Section 2');
    assert.deepEqual(song.lyrics[1].lines, [
      'Amen Amen Amen',
      'Amen Amen Amen',
    ]);
    assert.equal(song.lyrics[2].section, 'Section 3');
  });

  it('handles mix of labeled and unlabeled sections', () => {
    const content = [
      'Title: Mixed Song',
      'Artist: Test',
      '',
      'Verse 1:',
      'First verse line',
      '',
      'Some unlabeled section',
      'More lyrics here',
      '',
      'Chorus:',
      'Chorus line',
    ].join('\n');

    const song = parseSongContent('mixed-song', content);

    assert.equal(song.lyrics.length, 3);
    assert.equal(song.lyrics[0].section, 'Verse 1');
    assert.equal(song.lyrics[1].section, 'Section 2');
    assert.deepEqual(song.lyrics[1].lines, [
      'Some unlabeled section',
      'More lyrics here',
    ]);
    assert.equal(song.lyrics[2].section, 'Chorus');
  });
});

describe('loadAllSongs', () => {
  it('loads all .txt files from a directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'songs-test-'));
    fs.writeFileSync(
      path.join(tmpDir, 'song-a.txt'),
      'Title: Song A\nArtist: Artist A\n\nVerse 1:\nLyrics A\n'
    );
    fs.writeFileSync(
      path.join(tmpDir, 'song-b.txt'),
      'Title: Song B\nArtist: Artist B\n\nVerse 1:\nLyrics B\n'
    );

    const songs = loadAllSongs(tmpDir);
    assert.equal(songs.length, 2);

    const ids = songs.map(s => s.id).sort();
    assert.deepEqual(ids, ['song-a', 'song-b']);

    fs.rmSync(tmpDir, { recursive: true });
  });

  it('ignores non-txt files', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'songs-test-'));
    fs.writeFileSync(
      path.join(tmpDir, 'song.txt'),
      'Title: Song\nArtist: Test\n\nVerse 1:\nLyrics\n'
    );
    fs.writeFileSync(path.join(tmpDir, 'readme.md'), '# Not a song');
    fs.writeFileSync(path.join(tmpDir, 'data.json'), '{}');

    const songs = loadAllSongs(tmpDir);
    assert.equal(songs.length, 1);
    assert.equal(songs[0].id, 'song');

    fs.rmSync(tmpDir, { recursive: true });
  });
});
