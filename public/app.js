const searchInput = document.getElementById('search-input');
const songList = document.getElementById('song-list');
const songListView = document.getElementById('song-list-view');
const songDetailView = document.getElementById('song-detail-view');
const songDetail = document.getElementById('song-detail');
const backBtn = document.getElementById('back-btn');

let debounceTimer = null;

async function fetchSongs(query) {
  const url = query ? `/api/songs?q=${encodeURIComponent(query)}` : '/api/songs';
  const res = await fetch(url);
  return res.json();
}

async function fetchSongDetail(id) {
  const res = await fetch(`/api/songs/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}

function renderSongList(songs) {
  songList.innerHTML = '';
  if (songs.length === 0) {
    songList.innerHTML = '<li class="empty">No songs found</li>';
    return;
  }
  for (const song of songs) {
    const li = document.createElement('li');
    li.className = 'song-item';
    li.innerHTML = `
      <span class="song-title">${escapeHtml(song.title || 'Untitled')}</span>
      <span class="song-artist">${escapeHtml(song.artist || 'Unknown artist')}</span>
    `;
    li.addEventListener('click', () => showSongDetail(song.id));
    songList.appendChild(li);
  }
}

function renderSongDetail(song) {
  const metaHtml = `
    <h2>${escapeHtml(song.title || 'Untitled')}</h2>
    <div class="song-meta">
      <span><strong>Artist:</strong> ${escapeHtml(song.artist || 'Unknown')}</span>
      ${song.key ? `<span><strong>Key:</strong> ${escapeHtml(song.key)}</span>` : ''}
      ${song.tempo ? `<span><strong>Tempo:</strong> ${escapeHtml(song.tempo)}</span>` : ''}
    </div>
  `;

  const lyricsHtml = song.lyrics.map(section => `
    <div class="lyrics-section">
      <p>${section.lines.map(escapeHtml).join('<br>')}</p>
    </div>
  `).join('');

  songDetail.innerHTML = metaHtml + '<div class="lyrics">' + lyricsHtml + '</div>';
}

async function showSongDetail(id) {
  const song = await fetchSongDetail(id);
  if (!song) return;
  renderSongDetail(song);
  songListView.classList.add('hidden');
  songDetailView.classList.remove('hidden');
}

function showSongList() {
  songDetailView.classList.add('hidden');
  songListView.classList.remove('hidden');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const songs = await fetchSongs(searchInput.value.trim());
    renderSongList(songs);
  }, 200);
});

backBtn.addEventListener('click', showSongList);

// Initial load
fetchSongs().then(renderSongList);
