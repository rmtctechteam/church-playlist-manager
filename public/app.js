// === DOM Elements ===
const searchInput = document.getElementById('search-input');
const songList = document.getElementById('song-list');
const songDetailPanel = document.getElementById('song-detail-panel');
const songFilter = document.getElementById('song-filter');
const songSort = document.getElementById('song-sort');

const songsTab = document.getElementById('songs-tab');
const playlistsTab = document.getElementById('playlists-tab');
const playlistListView = document.getElementById('playlist-list-view');
const playlistEditorView = document.getElementById('playlist-editor-view');
const playlistDisplayView = document.getElementById('playlist-display-view');
const playlistListEl = document.getElementById('playlist-list');
const playlistEditorEl = document.getElementById('playlist-editor');
const playlistDisplayEl = document.getElementById('playlist-display');
const newPlaylistBtn = document.getElementById('new-playlist-btn');
const editorBackBtn = document.getElementById('editor-back-btn');
const displayBackBtn = document.getElementById('display-back-btn');

const homeView = document.getElementById('home-view');
const homeLink = document.getElementById('home-link');
const tabBar = document.querySelector('.tab-bar');

let debounceTimer = null;
let serviceTypes = [];
let songSuggestionsEnabled = false;

const featuresReady = fetch('/api/config/features')
  .then(r => r.json())
  .then(f => { songSuggestionsEnabled = !!f.songSuggestions; })
  .catch(() => {});

// === Utility ===
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, duration = 2500) {
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'app-toast';
  toast.className = 'app-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('app-toast-visible'));
  setTimeout(() => {
    toast.classList.remove('app-toast-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// === Home / Navigation ===
function showHome() {
  homeView.classList.remove('hidden');
  songsTab.classList.add('hidden');
  playlistsTab.classList.add('hidden');
  tabBar.classList.add('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
}

function navigateToSection(section) {
  homeView.classList.add('hidden');
  tabBar.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === section);
  });
  songsTab.classList.toggle('hidden', section !== 'songs');
  playlistsTab.classList.toggle('hidden', section !== 'playlists');
  if (section === 'playlists') showPlaylistListView();
  if (section === 'songs') {
    fetchSongs().then(songs => { allSongs = songs; renderSongList(allSongs); });
  }
}

homeLink.addEventListener('click', showHome);
document.getElementById('home-nav-btn').addEventListener('click', showHome);

// Bento card handlers
document.getElementById('bento-create-playlist').addEventListener('click', () => {
  navigateToSection('playlists');
  loadServiceTypes().then(() => showNewPlaylistForm());
});

document.getElementById('bento-list-playlists').addEventListener('click', () => {
  navigateToSection('playlists');
});

document.getElementById('bento-all-songs').addEventListener('click', () => {
  navigateToSection('songs');
});

// === Tab Navigation ===
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    songsTab.classList.toggle('hidden', target !== 'songs');
    playlistsTab.classList.toggle('hidden', target !== 'playlists');
    if (target === 'playlists') showPlaylistListView();
    if (target === 'songs' && allSongs.length === 0) fetchSongs().then(songs => { allSongs = songs; renderSongList(allSongs); });
  });
});

// === Songs Tab ===
let allSongs = [];
let usageSummaryCache = null;
let filteredSongIds = null;
let activeSongId = null;

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

async function ensureUsageSummary() {
  if (!usageSummaryCache) {
    const res = await fetch('/api/songs/usage-summary');
    usageSummaryCache = await res.json();
  }
  return usageSummaryCache;
}

function applySortAndFilter(songs) {
  let result = [...songs];

  // Apply filter
  if (filteredSongIds) {
    const idSet = new Set(filteredSongIds);
    result = result.filter(s => idSet.has(s.id));
  }

  // Apply sort
  const sortValue = songSort.value;
  if (sortValue === 'title-za') {
    result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  } else if (sortValue === 'last-used' && usageSummaryCache) {
    result.sort((a, b) => {
      const aDate = usageSummaryCache[a.id]?.lastUsed || '';
      const bDate = usageSummaryCache[b.id]?.lastUsed || '';
      return bDate.localeCompare(aDate);
    });
  } else if (sortValue === 'most-used' && usageSummaryCache) {
    result.sort((a, b) => {
      const aCount = usageSummaryCache[a.id]?.count || 0;
      const bCount = usageSummaryCache[b.id]?.count || 0;
      return bCount - aCount;
    });
  } else {
    result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  return result;
}

function renderSongList(songs) {
  songList.innerHTML = '';
  const sorted = applySortAndFilter(songs);
  if (sorted.length === 0) {
    songList.innerHTML = '<li class="empty">No songs found</li>';
    return;
  }
  for (const song of sorted) {
    const li = document.createElement('li');
    li.className = 'song-item' + (song.id === activeSongId ? ' active' : '');
    li.innerHTML = `<span class="song-title">${escapeHtml(song.title || 'Untitled')}</span>${song.lyricsPreview ? `<span class="song-preview">${escapeHtml(song.lyricsPreview)}</span>` : ''}`;
    li.addEventListener('click', () => selectSong(song.id));
    songList.appendChild(li);
  }
}

function renderMusicSection(song) {
  if (!song.key && !song.notes) return '';
  const keyHtml = song.key ? `<span class="detail-key">Key: ${escapeHtml(song.key)}</span>` : '';
  const notesHtml = song.notes ? `<div class="music-notes">${escapeHtml(song.notes)}</div>` : '';
  return `<div class="song-music-section"><h4>Music</h4>${keyHtml}${notesHtml}</div>`;
}

function extractYoutubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    return u.searchParams.get('v') || u.pathname.split('/').pop();
  } catch (_) { return url; }
}

function renderYoutubeSection(song) {
  const urls = song.youtubeUrls || [];
  const cardsHtml = urls.map((url, i) => {
    const id = extractYoutubeId(url);
    return `
      <a class="youtube-card" href="${escapeHtml(url)}" target="_blank" rel="noopener">
        <span class="youtube-card-icon">▶</span>
        <span class="youtube-card-label">YouTube · ${escapeHtml(id)}</span>
        <button class="youtube-remove-btn" data-idx="${i}" title="Remove" aria-label="Remove">✕</button>
      </a>`;
  }).join('');

  return `
    <div class="youtube-section" data-song-id="${escapeHtml(song.id)}">
      <h4>YouTube References</h4>
      <div class="youtube-cards">${cardsHtml}</div>
      <div class="youtube-add-row">
        <input class="youtube-add-input" type="url" placeholder="https://youtu.be/... or youtube.com/watch?v=...">
        <button class="btn btn-secondary btn-sm youtube-add-btn">Add</button>
      </div>
      <div class="youtube-error" style="display:none"></div>
    </div>`;
}

async function selectSong(id) {
  activeSongId = id;
  // Update active class in list
  songList.querySelectorAll('.song-item').forEach((li, i) => {
    li.classList.toggle('active', li.querySelector('.song-title')?.textContent === document.querySelector(`.song-item.active`)?.querySelector('.song-title')?.textContent);
  });
  // Simpler: re-highlight by re-querying
  songList.querySelectorAll('.song-item').forEach(li => li.classList.remove('active'));
  const items = songList.querySelectorAll('.song-item');
  items.forEach(li => {
    // Match by click handler — instead, just refetch and render detail
  });

  // Show loading state
  songDetailPanel.innerHTML = '<div class="song-detail-placeholder"><p>Loading...</p></div>';

  const [song, summary] = await Promise.all([
    fetchSongDetail(id),
    ensureUsageSummary(),
  ]);

  if (!song) {
    songDetailPanel.innerHTML = '<div class="song-detail-placeholder"><p>Song not found</p></div>';
    return;
  }

  // Re-highlight active in list
  songList.querySelectorAll('.song-item').forEach(li => {
    li.classList.remove('active');
  });
  // Find the clicked item by iterating and matching
  const allItems = songList.querySelectorAll('.song-item');
  allItems.forEach(li => {
    const titleEl = li.querySelector('.song-title');
    if (titleEl && titleEl.textContent === (song.title || 'Untitled')) {
      li.classList.add('active');
    }
  });

  const lastUsed = summary[id]?.lastUsed;
  const usageHtml = lastUsed
    ? `<div class="detail-last-used">Last added to a playlist: ${lastUsed}</div>`
    : `<div class="detail-last-used">Never used in a playlist</div>`;

  const lyricsHtml = song.lyrics.map(section => `
    <div class="lyrics-section">
      <p>${section.lines.map(escapeHtml).join('<br>')}</p>
    </div>
  `).join('');

  const detailHtml = `
    <div class="song-detail-content">
      <h2>${escapeHtml(song.title || 'Untitled')}</h2>
      ${usageHtml}
      ${renderMusicSection(song)}
      ${renderYoutubeSection(song)}
      <div class="detail-lyrics">${lyricsHtml}</div>
    </div>
  `;

  // On mobile, show as a modal; on desktop, populate the side panel
  if (window.innerWidth <= 768) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay song-detail-modal-overlay';
    overlay.innerHTML = `
      <div class="modal song-detail-modal">
        <button class="song-detail-modal-close" id="song-detail-close-btn" aria-label="Close">✕</button>
        ${detailHtml}
      </div>
    `;
    document.body.appendChild(overlay);
    attachYoutubeHandlers(overlay, song);
    document.getElementById('song-detail-close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  } else {
    songDetailPanel.innerHTML = detailHtml;
    attachYoutubeHandlers(songDetailPanel, song);
  }
}

function attachYoutubeHandlers(container, song) {
  const section = container.querySelector('.youtube-section');
  if (!section) return;
  const songId = section.dataset.songId;
  const errorEl = section.querySelector('.youtube-error');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = '';
  }
  function clearError() { errorEl.style.display = 'none'; errorEl.textContent = ''; }

  async function patchUrls(urls) {
    const res = await fetch(`/api/songs/${encodeURIComponent(songId)}/youtube`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtubeUrls: urls }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save');
    }
    return res.json();
  }

  // Remove buttons
  section.querySelectorAll('.youtube-remove-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      clearError();
      const idx = parseInt(btn.dataset.idx);
      const updated = [...(song.youtubeUrls || [])];
      updated.splice(idx, 1);
      try {
        const updatedSong = await patchUrls(updated);
        song.youtubeUrls = updatedSong.youtubeUrls;
        section.querySelector('.youtube-cards').innerHTML = (song.youtubeUrls || []).map((url, i) => {
          const id = extractYoutubeId(url);
          return `<a class="youtube-card" href="${escapeHtml(url)}" target="_blank" rel="noopener">
            <span class="youtube-card-icon">▶</span>
            <span class="youtube-card-label">YouTube · ${escapeHtml(id)}</span>
            <button class="youtube-remove-btn" data-idx="${i}" title="Remove" aria-label="Remove">✕</button>
          </a>`;
        }).join('');
        attachYoutubeHandlers(container, song);
      } catch (err) {
        showError(err.message);
      }
    });
  });

  // Add button
  const addBtn = section.querySelector('.youtube-add-btn');
  const addInput = section.querySelector('.youtube-add-input');
  addBtn.addEventListener('click', async () => {
    clearError();
    const url = addInput.value.trim();
    if (!url.startsWith('https://') || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      showError('Please enter a valid YouTube URL (youtube.com or youtu.be)');
      return;
    }
    const updated = [...(song.youtubeUrls || []), url];
    try {
      const updatedSong = await patchUrls(updated);
      song.youtubeUrls = updatedSong.youtubeUrls;
      addInput.value = '';
      section.querySelector('.youtube-cards').innerHTML = (song.youtubeUrls || []).map((u, i) => {
        const vid = extractYoutubeId(u);
        return `<a class="youtube-card" href="${escapeHtml(u)}" target="_blank" rel="noopener">
          <span class="youtube-card-icon">▶</span>
          <span class="youtube-card-label">YouTube · ${escapeHtml(vid)}</span>
          <button class="youtube-remove-btn" data-idx="${i}" title="Remove" aria-label="Remove">✕</button>
        </a>`;
      }).join('');
      attachYoutubeHandlers(container, song);
    } catch (err) {
      showError(err.message);
    }
  });
}

async function loadAndRenderSongs() {
  const query = searchInput.value.trim();
  const songs = await fetchSongs(query);
  if (!query) allSongs = songs;
  renderSongList(query ? songs : allSongs);
}

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => loadAndRenderSongs(), 200);
});

songFilter.addEventListener('change', async () => {
  const val = songFilter.value;
  if (val === 'all') {
    filteredSongIds = null;
  } else if (val === 'not-90') {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const dateStr = since.toISOString().split('T')[0];
    const res = await fetch(`/api/songs/used?since=${dateStr}`);
    const usedIds = new Set(await res.json());
    filteredSongIds = allSongs.map(s => s.id).filter(id => !usedIds.has(id));
  } else {
    await ensureUsageSummary();
    const days = parseInt(val);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const dateStr = since.toISOString().split('T')[0];
    const res = await fetch(`/api/songs/used?since=${dateStr}`);
    filteredSongIds = await res.json();
  }
  renderSongList(searchInput.value.trim() ? await fetchSongs(searchInput.value.trim()) : allSongs);
});

songSort.addEventListener('change', async () => {
  const val = songSort.value;
  if (val === 'last-used' || val === 'most-used') {
    await ensureUsageSummary();
  }
  renderSongList(searchInput.value.trim() ? await fetchSongs(searchInput.value.trim()) : allSongs);
});

// === Song Upload ===
document.getElementById('upload-song-btn').addEventListener('click', () => {
  document.getElementById('song-upload-input').click();
});

document.getElementById('song-upload-input').addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (const file of files) formData.append('songs', file);

  let results;
  try {
    const res = await fetch('/api/songs/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    results = await res.json();
  } catch (err) {
    alert(`Upload failed: ${err.message}`);
    e.target.value = '';
    return;
  }

  // Refresh song list
  allSongs = await fetchSongs();
  renderSongList(allSongs);

  // Report results
  const succeeded = results.filter(r => r.success).map(r => r.filename);
  const failed = results.filter(r => !r.success).map(r => `${r.filename} (${r.error})`);
  const parts = [];
  if (succeeded.length) parts.push(`Uploaded: ${succeeded.join(', ')}`);
  if (failed.length) parts.push(`Failed: ${failed.join(', ')}`);
  alert(parts.join('\n'));

  // Reset input so same file can be re-selected if needed
  e.target.value = '';
});

// === Playlists Tab ===

async function loadServiceTypes() {
  const res = await fetch('/api/service-types');
  serviceTypes = await res.json();
}

function getServiceTypeName(typeId) {
  if (typeId === 'custom') return 'Custom';
  const st = serviceTypes.find(t => t.id === typeId);
  return st ? st.name : typeId;
}

let allPlaylists = [];
let activeSubtab = 'upcoming';

// Subtab switching
document.querySelectorAll('.subtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.subtab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeSubtab = tab.dataset.subtab;
    renderPlaylistList(allPlaylists);
  });
});

async function loadPlaylistList() {
  const res = await fetch('/api/playlists');
  allPlaylists = await res.json();
  renderPlaylistList(allPlaylists);
}

function renderPlaylistList(playlists) {
  const today = new Date().toISOString().slice(0, 10);

  let filtered;
  if (activeSubtab === 'upcoming') {
    const upcoming = playlists.filter(p => p.date && p.date >= today);
    const unscheduled = playlists.filter(p => !p.date);
    upcoming.sort((a, b) => a.date.localeCompare(b.date));
    filtered = [...upcoming, ...unscheduled];
  } else {
    filtered = playlists.filter(p => p.date && p.date < today);
    filtered.sort((a, b) => b.date.localeCompare(a.date));
  }

  if (filtered.length === 0) {
    playlistListEl.innerHTML = activeSubtab === 'upcoming'
      ? '<div class="playlist-empty">No upcoming playlists. Create one to get started!</div>'
      : '<div class="playlist-empty">No past playlists.</div>';
    return;
  }

  let html = '';
  const isPast = activeSubtab === 'past';

  if (activeSubtab === 'upcoming') {
    const upcoming = filtered.filter(p => p.date);
    const unscheduled = filtered.filter(p => !p.date);
    if (upcoming.length > 0) {
      html += upcoming.map(p => playlistCardHtml(p, false)).join('');
    }
    if (unscheduled.length > 0) {
      html += '<div class="playlist-group-label">Unscheduled</div>';
      html += unscheduled.map(p => playlistCardHtml(p, false)).join('');
    }
  } else {
    html += filtered.map(p => playlistCardHtml(p, true)).join('');
  }

  playlistListEl.innerHTML = html;

  // Attach click handlers
  playlistListEl.querySelectorAll('.playlist-card').forEach(card => {
    const id = card.dataset.id;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.playlist-card-actions')) return;
      openPlaylistEditor(id);
    });
  });

  playlistListEl.querySelectorAll('.display-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPlaylistDisplay(btn.dataset.id);
    });
  });
}

function playlistCardHtml(playlist, isPast) {
  const songCount = playlist.sections.reduce((sum, s) => sum + (s.songIds || s.songs || []).length, 0);
  return `
    <div class="playlist-card ${isPast ? 'past' : ''}" data-id="${escapeHtml(playlist.id)}">
      <div class="playlist-card-top">
        <div class="playlist-card-info">
          <div class="playlist-card-name">${escapeHtml(playlist.name)}</div>
          <div class="playlist-card-meta">
            ${playlist.date || 'No date'} &middot; ${escapeHtml(getServiceTypeName(playlist.type))} &middot; ${songCount} song${songCount !== 1 ? 's' : ''}
          </div>
        </div>
        <div class="playlist-card-actions">
          <button class="btn btn-small btn-secondary display-action" data-id="${escapeHtml(playlist.id)}">Display</button>
        </div>
      </div>
    </div>
  `;
}

// === Playlist Editor ===

let currentPlaylist = null;

newPlaylistBtn.addEventListener('click', () => showNewPlaylistForm());
editorBackBtn.addEventListener('click', () => showPlaylistListView());

function showPlaylistListView() {
  playlistEditorView.classList.add('hidden');
  playlistDisplayView.classList.add('hidden');
  playlistListView.classList.remove('hidden');
  loadPlaylistList();
}

function showNewPlaylistForm() {
  playlistListView.classList.add('hidden');
  playlistEditorView.classList.remove('hidden');

  const typeOptions = serviceTypes.map(t =>
    `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`
  ).join('') + '<option value="custom">Custom</option>';

  playlistEditorEl.innerHTML = `
    <h2>New Playlist</h2>
    <div class="editor-form">
      <div class="form-row">
        <div class="form-group">
          <label for="pl-date">Service Date</label>
          <input type="date" id="pl-date" required>
        </div>
        <div class="form-group">
          <label for="pl-type">Service Type</label>
          <select id="pl-type">${typeOptions}</select>
        </div>
      </div>
      <div class="form-group">
        <label for="pl-name">Name</label>
        <input type="text" id="pl-name" placeholder="e.g., Sunday Morning Worship">
      </div>
      <div id="custom-sections-group" class="form-group hidden">
        <label for="pl-custom-sections">Section Names (comma-separated)</label>
        <input type="text" id="pl-custom-sections" placeholder="e.g., Welcome, Main Set, Closing">
      </div>
      <div class="editor-actions">
        <button class="btn btn-primary" id="create-playlist-btn">Create Playlist</button>
        <button class="btn btn-secondary" id="cancel-create-btn">Cancel</button>
      </div>
    </div>
  `;

  const nameInput = document.getElementById('pl-name');
  const typeSelect = document.getElementById('pl-type');
  const dateInput = document.getElementById('pl-date');
  const customGroup = document.getElementById('custom-sections-group');

  let nameManuallyEdited = false;

  function autoPopulateName() {
    if (nameManuallyEdited) return;
    const type = typeSelect.value;
    const typeName = type === 'custom' ? 'Custom' : (serviceTypes.find(t => t.id === type)?.name || type);
    const date = dateInput.value;
    nameInput.value = date ? `${date} - ${typeName}` : typeName;
  }

  nameInput.addEventListener('input', () => { nameManuallyEdited = true; });

  typeSelect.addEventListener('change', () => {
    customGroup.classList.toggle('hidden', typeSelect.value !== 'custom');
    autoPopulateName();
  });

  dateInput.addEventListener('change', autoPopulateName);

  // Auto-populate with the default selected type
  autoPopulateName();

  document.getElementById('create-playlist-btn').addEventListener('click', createPlaylist);
  document.getElementById('cancel-create-btn').addEventListener('click', showPlaylistListView);
}

async function createPlaylist() {
  const name = document.getElementById('pl-name').value.trim();
  const type = document.getElementById('pl-type').value;
  const date = document.getElementById('pl-date').value || null;

  if (!date) { alert('Please select a service date.'); return; }
  if (!name) { alert('Please enter a playlist name.'); return; }

  const body = { name, type, date };

  if (type === 'custom') {
    const raw = document.getElementById('pl-custom-sections').value.trim();
    if (!raw) { alert('Please enter section names for custom type.'); return; }
    body.sections = raw.split(',').map(s => ({ name: s.trim() })).filter(s => s.name);
    if (body.sections.length === 0) { alert('Please enter at least one section name.'); return; }
  }

  const res = await fetch('/api/playlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Failed to create playlist');
    return;
  }

  const playlist = await res.json();
  openPlaylistEditor(playlist.id, { autoLookup: true, autoSuggest: true });
}

async function openPlaylistEditor(id, { autoLookup = false, autoSuggest = false } = {}) {
  const [res] = await Promise.all([
    fetch(`/api/playlists/${encodeURIComponent(id)}`),
    featuresReady,
  ]);
  if (!res.ok) return;
  currentPlaylist = await res.json();

  playlistListView.classList.add('hidden');
  playlistDisplayView.classList.add('hidden');
  playlistEditorView.classList.remove('hidden');

  renderPlaylistEditor({ autoLookup, autoSuggest });
}

function renderPlaylistEditor({ autoLookup = false, autoSuggest = false } = {}) {
  const p = currentPlaylist;

  let sectionsHtml = '';
  for (let si = 0; si < p.sections.length; si++) {
    const section = p.sections[si];
    const songs = section.songs || [];

    let songsListHtml = '';
    if (songs.length === 0) {
      songsListHtml = '<div class="section-empty">No songs yet</div>';
    } else {
      songsListHtml = songs.map((song, songIdx) => {
        if (song.notFound) {
          return `<div class="section-song-item">
            <span class="song-info"><em>${escapeHtml(song.id)}</em> (not found)</span>
            <span class="song-controls">
              <button class="btn-icon remove-song-btn" data-section="${si}" data-song="${songIdx}">x</button>
            </span>
          </div>`;
        }
        const ov = song._override || {};
        return `<div class="section-song-item">
          <span class="song-info">
            ${escapeHtml(song.title || 'Untitled')}
          </span>
          <span class="song-controls">
            <button class="btn-icon move-up-btn" data-section="${si}" data-song="${songIdx}" ${songIdx === 0 ? 'disabled' : ''}>&#9650;</button>
            <button class="btn-icon move-down-btn" data-section="${si}" data-song="${songIdx}" ${songIdx === songs.length - 1 ? 'disabled' : ''}>&#9660;</button>
            <button class="btn-icon remove-song-btn" data-section="${si}" data-song="${songIdx}">x</button>
          </span>
          <div class="song-override-row">
            <input class="override-input" type="text" placeholder="Key${song.key ? ` (${escapeHtml(song.key)})` : ''}" value="${escapeHtml(ov.key || '')}" data-section="${si}" data-song="${songIdx}" data-field="key">
            <input class="override-input" type="text" placeholder="Tempo${song.tempo ? ` (${escapeHtml(song.tempo)})` : ''}" value="${escapeHtml(ov.tempo || '')}" data-section="${si}" data-song="${songIdx}" data-field="tempo">
            <input class="override-input override-input--notes" type="text" placeholder="Notes" value="${escapeHtml(ov.notes || '')}" data-section="${si}" data-song="${songIdx}" data-field="notes">
          </div>
        </div>`;
      }).join('');
    }

    sectionsHtml += `
      <div class="section-block">
        <div class="section-heading">${escapeHtml(section.name)}</div>
        <div class="section-songs">${songsListHtml}</div>
        <div class="section-add-song">
          <input type="text" class="song-search-input" data-section="${si}" placeholder="Search songs to add...">
          <div class="song-search-results hidden" data-section="${si}"></div>
        </div>
      </div>
    `;
  }

  playlistEditorEl.innerHTML = `
    <div class="editor-page-header">
      <span class="editor-page-title">${escapeHtml(p.name)}</span>
    </div>
    <div class="editor-layout">
      <div class="editor-sidebar">
        <div class="editor-form">
          <div class="form-group">
            <label for="edit-name">Name</label>
            <input type="text" id="edit-name" value="${escapeHtml(p.name)}">
          </div>
          <div class="form-group">
            <label>Type</label>
            <input type="text" value="${escapeHtml(getServiceTypeName(p.type))}" disabled>
          </div>
          <div class="form-group">
            <label for="edit-date">Service Date</label>
            <input type="date" id="edit-date" value="${p.date || ''}">
          </div>
          <div class="form-group">
            <label for="edit-google-doc">Song Sheet Google Doc</label>
            <input type="url" id="edit-google-doc" value="${escapeHtml(p.googleDoc || '')}" placeholder="https://docs.google.com/...">
          </div>
          <div class="form-group">
            <label for="edit-notes">Notes</label>
            <textarea id="edit-notes" rows="3">${escapeHtml(p.notes || '')}</textarea>
          </div>
        </div>
      </div>
      <div class="editor-main">
        <div class="editor-header-summary">
          <div class="header-summary-row">
            <span><strong>Date:</strong> ${p.date || '<span class="summary-placeholder">Not set</span>'}</span>
            <span><strong>Type:</strong> ${escapeHtml(getServiceTypeName(p.type))}</span>
          </div>
          <div class="header-summary-row">
            <label class="summary-label" for="edit-theme"><strong>Theme</strong></label>
            <textarea id="edit-theme" class="summary-textarea" rows="2" placeholder="e.g., Grace and Forgiveness">${escapeHtml(p.theme || '')}</textarea>
          </div>
          <div class="header-summary-row">
            <label class="summary-label" for="edit-bible-lessons"><strong>Lessons</strong></label>
            <textarea id="edit-bible-lessons" class="summary-textarea" rows="3" placeholder="e.g., Romans 8:28&#10;John 3:16">${escapeHtml((p.bibleLessons || '').replace(/, /g, '\n'))}</textarea>
          </div>
        </div>
        <div class="editor-lookup-action">
          <button class="btn btn-secondary" id="lookup-lectionary-btn">Lookup Theme & Lessons</button>
        </div>
        <h3 class="editor-main-heading">Songs</h3>
        ${sectionsHtml}
      </div>
    </div>
    <div class="editor-bottom-actions">
      <div class="editor-bottom-primary">
        <button class="btn btn-primary" id="save-playlist-btn">Save Playlist</button>
        <button class="btn btn-secondary" id="display-from-editor-btn">Display Songs</button>
        ${songSuggestionsEnabled ? '<button class="btn btn-secondary" id="suggest-songs-btn">Suggest Songs</button>' : ''}
      </div>
      <div class="editor-bottom-secondary">
        <button class="btn btn-secondary" id="export-doc-btn">Export .docx</button>
        <button class="btn btn-secondary" id="create-google-doc-btn">Create Google Doc</button>
        <button class="btn btn-danger btn-outline" id="delete-playlist-btn">Delete</button>
      </div>
    </div>
    <div id="delete-modal" class="modal-overlay hidden">
      <div class="modal">
        <h3>Delete Playlist</h3>
        <p>Are you sure you want to delete <strong>${escapeHtml(p.name)}</strong>? This cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-danger" id="confirm-delete-btn">Delete</button>
          <button class="btn btn-secondary" id="cancel-delete-btn">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('save-playlist-btn').addEventListener('click', savePlaylist);
  document.getElementById('display-from-editor-btn').addEventListener('click', () => openPlaylistDisplay(currentPlaylist.id));
  document.getElementById('export-doc-btn').addEventListener('click', () => {
    window.location.href = `/api/playlists/${encodeURIComponent(currentPlaylist.id)}/export`;
  });

  if (songSuggestionsEnabled) {
    document.getElementById('suggest-songs-btn').addEventListener('click', () => fetchAndShowSuggestions());
  }

  document.getElementById('create-google-doc-btn').addEventListener('click', async () => {
    const btn = document.getElementById('create-google-doc-btn');
    btn.disabled = true;
    btn.textContent = 'Creating...';
    try {
      const res = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}/google-doc`, {
        method: 'POST',
      });
      if (res.status === 401) {
        window.location.href = '/auth/login?returnTo=/';
        return;
      }
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const err = await res.json();
          alert(err.error || 'Failed to create Google Doc');
        } else {
          alert(`Failed to create Google Doc (HTTP ${res.status})`);
        }
        return;
      }
      const { docUrl } = await res.json();
      // Refresh playlist data so googleDoc URL is reflected
      const res2 = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`);
      if (res2.ok) currentPlaylist = await res2.json();
      renderPlaylistEditor();
      // Open the doc
      window.open(docUrl, '_blank', 'noopener');
    } catch (err) {
      alert('Failed to create Google Doc: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Google Doc';
    }
  });

  async function runLectionaryLookup({ silent = false } = {}) {
    const date = document.getElementById('edit-date').value;
    if (!date) {
      if (!silent) alert('Please set a service date first.');
      return;
    }
    const btn = document.getElementById('lookup-lectionary-btn');
    btn.disabled = true;
    btn.textContent = 'Looking up...';
    try {
      const res = await fetch(`/api/lectionary?date=${encodeURIComponent(date)}`);
      if (!res.ok) {
        if (!silent) {
          const err = await res.json();
          alert(err.error || 'Lookup failed');
        }
        return;
      }
      const data = await res.json();
      document.getElementById('edit-theme').value = data.theme;
      document.getElementById('edit-bible-lessons').value = data.bibleLessons.split(', ').join('\n');
    } catch (_) {
      if (!silent) alert('Failed to reach the lectionary service.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Lookup Theme & Lessons';
    }
  }

  document.getElementById('lookup-lectionary-btn').addEventListener('click', () => runLectionaryLookup());

  if (autoLookup) {
    runLectionaryLookup({ silent: true }).then(() => {
      if (autoSuggest && songSuggestionsEnabled) showSuggestionsChoice();
    });
  }

  const deleteModal = document.getElementById('delete-modal');
  document.getElementById('delete-playlist-btn').addEventListener('click', () => {
    deleteModal.classList.remove('hidden');
  });
  document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    deleteModal.classList.add('hidden');
  });
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) deleteModal.classList.add('hidden');
  });
  document.getElementById('confirm-delete-btn').addEventListener('click', deletePlaylist);

  // Song search inputs
  playlistEditorEl.querySelectorAll('.song-search-input').forEach(input => {
    let timer = null;
    const sectionIdx = parseInt(input.dataset.section);
    const resultsEl = playlistEditorEl.querySelector(`.song-search-results[data-section="${sectionIdx}"]`);

    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (!q) { resultsEl.classList.add('hidden'); return; }
      timer = setTimeout(async () => {
        const songs = await fetchSongs(q);
        if (songs.length === 0) {
          resultsEl.innerHTML = '<div class="song-search-result">No results</div>';
        } else {
          resultsEl.innerHTML = songs.slice(0, 10).map(s =>
            `<div class="song-search-result" data-id="${escapeHtml(s.id)}">` +
            `<span class="song-title">${escapeHtml(s.title || 'Untitled')}</span>` +
            `<small style="color:var(--gray-400)">${escapeHtml(s.artist || '')}</small>` +
            (s.lyricsPreview ? `<span class="song-preview">${escapeHtml(s.lyricsPreview)}</span>` : '') +
            `</div>`
          ).join('');

          resultsEl.querySelectorAll('.song-search-result').forEach(el => {
            el.addEventListener('click', () => {
              addSongToSection(sectionIdx, el.dataset.id);
              input.value = '';
              resultsEl.classList.add('hidden');
            });
          });
        }
        resultsEl.classList.remove('hidden');
      }, 200);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => resultsEl.classList.add('hidden'), 200);
    });
  });

  // Move/remove buttons
  playlistEditorEl.querySelectorAll('.move-up-btn').forEach(btn => {
    btn.addEventListener('click', () => moveSong(parseInt(btn.dataset.section), parseInt(btn.dataset.song), -1));
  });
  playlistEditorEl.querySelectorAll('.move-down-btn').forEach(btn => {
    btn.addEventListener('click', () => moveSong(parseInt(btn.dataset.section), parseInt(btn.dataset.song), 1));
  });
  playlistEditorEl.querySelectorAll('.remove-song-btn').forEach(btn => {
    btn.addEventListener('click', () => removeSongFromSection(parseInt(btn.dataset.section), parseInt(btn.dataset.song)));
  });

  // Music override inputs — update in-memory state without re-rendering
  playlistEditorEl.querySelectorAll('.override-input').forEach(input => {
    input.addEventListener('input', () => {
      const si = parseInt(input.dataset.section);
      const songIdx = parseInt(input.dataset.song);
      const field = input.dataset.field;
      sectionSongs(si)[songIdx][field] = input.value.trim() || null;
    });
  });

}

// === Song Suggestions ===

function showSuggestionsChoice() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'suggestions-choice-overlay';
  overlay.innerHTML = `
    <div class="modal suggestions-choice-modal">
      <h3>Song Suggestions</h3>
      <p>Would you like AI-powered song suggestions based on this service's theme and Bible passages?</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="pick-myself-btn">Pick Songs Myself</button>
        <button class="btn btn-primary" id="get-suggestions-btn">Get Song Suggestions</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('pick-myself-btn').addEventListener('click', () => overlay.remove());
  document.getElementById('get-suggestions-btn').addEventListener('click', async () => {
    overlay.remove();
    await fetchAndShowSuggestions();
  });
}

async function fetchAndShowSuggestions() {
  // Show loading overlay while fetching
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'swipe-overlay';
  loadingOverlay.id = 'suggestions-loading-overlay';
  loadingOverlay.innerHTML = `
    <div class="swipe-header">
      <div class="swipe-header-title">Song Suggestions</div>
    </div>
    <div class="suggestions-loading" style="color:#fff;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div class="suggestions-spinner"></div>
      <p>Finding songs that fit your service theme…</p>
    </div>
  `;
  document.body.appendChild(loadingOverlay);

  let suggestions, theme;
  try {
    const themeField = document.getElementById('edit-theme');
    const lessonsField = document.getElementById('edit-bible-lessons');
    const bodyPayload = {};
    if (themeField && themeField.value.trim()) bodyPayload.theme = themeField.value.trim();
    if (lessonsField && lessonsField.value.trim()) bodyPayload.bibleLessons = lessonsField.value.trim().split('\n').join(', ');

    const res = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });
    const data = await res.json();
    loadingOverlay.remove();

    if (!res.ok) {
      alert(data.error || 'Failed to get song suggestions. Please try again.');
      return;
    }

    suggestions = data.suggestions;
    theme = data.theme;
  } catch (err) {
    loadingOverlay.remove();
    alert('Failed to reach the suggestions service. You can pick songs manually.');
    return;
  }

  showSuggestionsAsSwipeCards(suggestions, theme);
}

function renderSuggestionCard(suggestion, sections) {
  const sectionOptions = sections.map(sec =>
    `<option value="${sec.idx}" ${sec.name === suggestion.section ? 'selected' : ''}>${escapeHtml(sec.name)}</option>`
  ).join('');
  const lastUsedHtml = suggestion.lastUsed
    ? `<span class="swipe-card-last-used">Last performed: ${formatDisplayDate(suggestion.lastUsed)}</span>`
    : `<span class="swipe-card-never-used">Never performed</span>`;

  const card = document.createElement('div');
  card.className = 'swipe-card';
  card.dataset.songId = suggestion.songId;
  card.innerHTML = `
    <div class="swipe-indicator swipe-indicator-add">Add ✓</div>
    <div class="swipe-indicator swipe-indicator-skip">✗ Skip</div>
    <div class="swipe-card-content">
      <div class="swipe-card-title">${escapeHtml(suggestion.title)}</div>
      <div class="swipe-card-reason">${escapeHtml(suggestion.reason)}</div>
      <div class="swipe-card-usage">${lastUsedHtml}</div>
      <div class="swipe-card-section-row">
        <label class="swipe-card-section-label">Add to:</label>
        <select class="swipe-card-section-select">${sectionOptions}</select>
      </div>
    </div>
  `;
  return card;
}

function showSuggestionsAsSwipeCards(suggestions, theme) {
  const sections = currentPlaylist.sections.map((s, i) => ({ name: s.name, idx: i }));
  let cardIndex = 0;
  const sessionAdded = [];

  const overlay = document.createElement('div');
  overlay.className = 'swipe-overlay';
  overlay.id = 'suggestions-swipe-overlay';
  overlay.innerHTML = `
    <div class="swipe-header">
      <div class="swipe-header-title">
        Song Suggestions${theme ? ` · <span class="swipe-theme-label">${escapeHtml(theme)}</span>` : ''}
      </div>
      <button class="btn btn-secondary swipe-close-btn" id="suggestions-done-btn">Done</button>
    </div>
    <div class="swipe-progress" id="suggestions-progress">${suggestions.length > 0 ? `1 / ${suggestions.length}` : '0 / 0'}</div>
    <div class="swipe-card-stack" id="suggestions-card-stack"></div>
    <div class="swipe-actions">
      <button class="btn swipe-btn swipe-btn-skip" id="suggestions-skip-btn">✗ Skip</button>
      <button class="btn swipe-btn swipe-btn-add" id="suggestions-add-btn">✓ Add</button>
    </div>
    <div class="swipe-hint">← Skip &nbsp;|&nbsp; Add →</div>
  `;
  document.body.appendChild(overlay);

  const cardStack = document.getElementById('suggestions-card-stack');

  function updateProgress() {
    const el = document.getElementById('suggestions-progress');
    if (el) el.textContent = `${Math.min(cardIndex + 1, suggestions.length)} / ${suggestions.length}`;
  }

  function renderTopCards() {
    cardStack.innerHTML = '';
    for (let i = Math.min(cardIndex + 2, suggestions.length - 1); i >= cardIndex; i--) {
      const card = renderSuggestionCard(suggestions[i], sections);
      if (i === cardIndex) {
        card.classList.add('swipe-card-top');
        attachCardGestures(card, handleAction);
      } else if (i === cardIndex + 1) {
        card.classList.add('swipe-card-behind-1');
      } else {
        card.classList.add('swipe-card-behind-2');
      }
      cardStack.appendChild(card);
    }
  }

  async function handleAction(direction) {
    if (cardIndex >= suggestions.length) return;
    const suggestion = suggestions[cardIndex];
    const topCard = cardStack.querySelector('.swipe-card-top');
    if (topCard?._cleanupMouse) topCard._cleanupMouse();

    if (direction === 'right') {
      if (topCard) topCard.classList.add('fly-right');
      // Get selected section from the card's dropdown
      const select = topCard?.querySelector('.swipe-card-section-select');
      const sectionIdx = select ? parseInt(select.value) : 0;

      const freshRes = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`);
      if (freshRes.ok) currentPlaylist = await freshRes.json();
      sectionSongs(sectionIdx).push({ id: suggestion.songId, key: null, tempo: null, notes: null });

      const saveRes = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: serialiseSections() }),
      });

      if (saveRes.ok) {
        const fresh = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`);
        if (fresh.ok) currentPlaylist = await fresh.json();
        sessionAdded.push({ title: suggestion.title, section: sections[sectionIdx]?.name });
      } else {
        sectionSongs(sectionIdx).pop();
        if (topCard) {
          topCard.classList.remove('fly-right');
          const errEl = document.createElement('div');
          errEl.className = 'swipe-card-error';
          errEl.textContent = 'Failed to save — try again.';
          topCard.querySelector('.swipe-card-content').appendChild(errEl);
        }
        return;
      }
    } else {
      if (topCard) topCard.classList.add('fly-left');
    }

    cardIndex++;
    setTimeout(() => {
      if (cardIndex >= suggestions.length) {
        showSuggestionsDone();
      } else {
        updateProgress();
        renderTopCards();
      }
    }, 280);
  }

  function showSuggestionsDone() {
    document.getElementById('suggestions-add-btn').disabled = true;
    document.getElementById('suggestions-skip-btn').disabled = true;
    if (sessionAdded.length === 0) {
      cardStack.innerHTML = `<div class="swipe-empty"><p>No suggestions added.</p><p class="swipe-empty-sub">You can add songs manually from the editor.</p></div>`;
    } else {
      cardStack.innerHTML = `
        <div class="swipe-summary">
          <div class="swipe-summary-title">Added ${sessionAdded.length} song${sessionAdded.length !== 1 ? 's' : ''}</div>
          <ul class="swipe-summary-list">
            ${sessionAdded.map(s => `<li>${escapeHtml(s.title)}${s.section ? ` → ${escapeHtml(s.section)}` : ''}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') { e.preventDefault(); handleAction('right'); }
    else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') { e.preventDefault(); handleAction('left'); }
  }
  document.addEventListener('keydown', onKeyDown);

  async function close() {
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
    const fresh = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`);
    if (fresh.ok) currentPlaylist = await fresh.json();
    renderPlaylistEditor();
  }

  document.getElementById('suggestions-done-btn').addEventListener('click', close);
  document.getElementById('suggestions-add-btn').addEventListener('click', () => handleAction('right'));
  document.getElementById('suggestions-skip-btn').addEventListener('click', () => handleAction('left'));

  if (suggestions.length === 0) {
    showSuggestionsDone();
  } else {
    renderTopCards();
  }
}

// === Shared swipe gesture helper ===

function attachCardGestures(card, onSwipe) {
  let startX = 0, currentX = 0, isDragging = false;
  const THRESHOLD = 80;

  function onStart(x) { startX = x; currentX = x; isDragging = true; }

  function onMove(x) {
    if (!isDragging) return;
    currentX = x;
    const dx = currentX - startX;
    card.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
    const addInd = card.querySelector('.swipe-indicator-add');
    const skipInd = card.querySelector('.swipe-indicator-skip');
    if (dx > THRESHOLD) {
      addInd.style.opacity = Math.min((dx - THRESHOLD) / 80, 1);
      skipInd.style.opacity = '0';
    } else if (dx < -THRESHOLD) {
      skipInd.style.opacity = Math.min((-dx - THRESHOLD) / 80, 1);
      addInd.style.opacity = '0';
    } else {
      addInd.style.opacity = '0';
      skipInd.style.opacity = '0';
    }
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    const dx = currentX - startX;
    card.style.transform = '';
    if (dx > THRESHOLD) {
      onSwipe('right');
    } else if (dx < -THRESHOLD) {
      onSwipe('left');
    } else {
      card.style.transition = 'transform 0.25s ease';
      card.style.transform = 'translateX(0) rotate(0)';
      card.querySelector('.swipe-indicator-add').style.opacity = '0';
      card.querySelector('.swipe-indicator-skip').style.opacity = '0';
      setTimeout(() => { card.style.transition = ''; }, 260);
    }
  }

  card.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
  card.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
  card.addEventListener('touchend', onEnd);
  card.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientX); });
  const onMouseMove = (e) => { if (isDragging) onMove(e.clientX); };
  const onMouseUp = () => { if (isDragging) onEnd(); };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  card._cleanupMouse = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
}

// === Swipe Song Picker ===

function buildSwipeDeck(songs, playlist) {
  const existingIds = new Set();
  for (const section of playlist.sections) {
    for (const song of (section.songs || [])) existingIds.add(song.id);
  }
  let deck = songs.filter(s => !existingIds.has(s.id));
  if (filteredSongIds) {
    const idSet = new Set(filteredSongIds);
    deck = deck.filter(s => idSet.has(s.id));
  }
  deck.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  return deck;
}

function renderSwipeCard(song, usageSummary) {
  const usage = usageSummary ? usageSummary[song.id] : null;
  const lastUsedHtml = usage?.lastUsed
    ? `<span class="swipe-card-last-used">Last used: ${formatDisplayDate(usage.lastUsed)}</span>`
    : `<span class="swipe-card-never-used">Never used</span>`;
  const card = document.createElement('div');
  card.className = 'swipe-card';
  card.dataset.songId = song.id;
  card.innerHTML = `
    <div class="swipe-indicator swipe-indicator-add">Add ✓</div>
    <div class="swipe-indicator swipe-indicator-skip">✗ Skip</div>
    <div class="swipe-card-content">
      <div class="swipe-card-title">${escapeHtml(song.title || 'Untitled')}</div>
      ${song.artist ? `<div class="swipe-card-artist">${escapeHtml(song.artist)}</div>` : ''}
      ${song.key ? `<div class="swipe-card-key">Key: ${escapeHtml(song.key)}</div>` : ''}
      ${song.lyricsPreview ? `<div class="swipe-card-lyrics">${escapeHtml(song.lyricsPreview)}</div>` : ''}
      <div class="swipe-card-usage">${lastUsedHtml}</div>
    </div>
  `;
  return card;
}

async function openSwipePicker(playlistId, sectionName) {
  if (allSongs.length === 0) allSongs = await fetchSongs();
  const usageSummary = await ensureUsageSummary();
  const deck = buildSwipeDeck(allSongs, currentPlaylist);
  let deckIndex = 0;
  const sessionAdded = [];
  const targetSectionIdx = currentPlaylist.sections.findIndex(s => s.name === sectionName);

  const overlay = document.createElement('div');
  overlay.className = 'swipe-overlay';
  overlay.id = 'swipe-picker-overlay';
  overlay.innerHTML = `
    <div class="swipe-header">
      <div class="swipe-header-title">Pick songs for <strong>${escapeHtml(sectionName)}</strong></div>
      <button class="btn btn-secondary swipe-close-btn" id="swipe-close-btn">Done</button>
    </div>
    <div class="swipe-progress" id="swipe-progress">${deck.length > 0 ? `1 / ${deck.length}` : '0 / 0'}</div>
    <div class="swipe-card-stack" id="swipe-card-stack"></div>
    <div class="swipe-actions">
      <button class="btn swipe-btn swipe-btn-skip" id="swipe-skip-btn">✗ Skip</button>
      <button class="btn swipe-btn swipe-btn-add" id="swipe-add-btn">✓ Add</button>
    </div>
    <div class="swipe-hint">← Skip &nbsp;|&nbsp; Add →  &nbsp;·&nbsp;  J / L keys</div>
  `;
  document.body.appendChild(overlay);

  const cardStack = document.getElementById('swipe-card-stack');

  function updateProgress() {
    const el = document.getElementById('swipe-progress');
    if (el) el.textContent = deck.length > 0 ? `${Math.min(deckIndex + 1, deck.length)} / ${deck.length}` : '0 / 0';
  }

  function renderTopCards() {
    cardStack.innerHTML = '';
    // Render cards behind first (highest index = further back), then top card last so it's on top in DOM
    for (let i = Math.min(deckIndex + 2, deck.length - 1); i >= deckIndex; i--) {
      const card = renderSwipeCard(deck[i], usageSummary);
      if (i === deckIndex) {
        card.classList.add('swipe-card-top');
        attachCardGestures(card, handleSwipeAction);
      } else if (i === deckIndex + 1) {
        card.classList.add('swipe-card-behind-1');
      } else {
        card.classList.add('swipe-card-behind-2');
      }
      cardStack.appendChild(card);
    }
  }

  async function handleSwipeAction(direction) {
    if (deckIndex >= deck.length) return;
    const song = deck[deckIndex];
    const topCard = cardStack.querySelector('.swipe-card-top');
    // Clean up mouse listeners from the card being dismissed
    if (topCard?._cleanupMouse) topCard._cleanupMouse();

    if (direction === 'right') {
      if (topCard) topCard.classList.add('fly-right');
      sectionSongs(targetSectionIdx).push({ id: song.id, key: null, tempo: null, notes: null });
      const saveRes = await fetch(`/api/playlists/${encodeURIComponent(playlistId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: serialiseSections() }),
      });
      if (saveRes.ok) {
        const fresh = await fetch(`/api/playlists/${encodeURIComponent(playlistId)}`);
        if (fresh.ok) currentPlaylist = await fresh.json();
        sessionAdded.push(song);
      } else {
        sectionSongs(targetSectionIdx).pop();
        if (topCard) {
          topCard.classList.remove('fly-right');
          const errEl = document.createElement('div');
          errEl.className = 'swipe-card-error';
          errEl.textContent = 'Failed to save — try again.';
          topCard.querySelector('.swipe-card-content').appendChild(errEl);
        }
        return;
      }
    } else {
      if (topCard) topCard.classList.add('fly-left');
    }

    deckIndex++;
    setTimeout(() => {
      if (deckIndex >= deck.length) {
        showSwipeEndState();
      } else {
        updateProgress();
        renderTopCards();
      }
    }, 280);
  }

  function showSwipeEndState() {
    document.getElementById('swipe-add-btn').disabled = true;
    document.getElementById('swipe-skip-btn').disabled = true;
    if (sessionAdded.length === 0) {
      cardStack.innerHTML = `<div class="swipe-empty"><p>No more songs to show.</p><p class="swipe-empty-sub">All songs have been reviewed or are already in the playlist.</p></div>`;
    } else {
      cardStack.innerHTML = `
        <div class="swipe-summary">
          <div class="swipe-summary-title">Added ${sessionAdded.length} song${sessionAdded.length !== 1 ? 's' : ''} to <strong>${escapeHtml(sectionName)}</strong></div>
          <ul class="swipe-summary-list">${sessionAdded.map(s => `<li>${escapeHtml(s.title || s.id)}</li>`).join('')}</ul>
        </div>
      `;
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') { e.preventDefault(); handleSwipeAction('right'); }
    else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') { e.preventDefault(); handleSwipeAction('left'); }
  }
  document.addEventListener('keydown', onKeyDown);

  async function closeSwipePicker() {
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
    const fresh = await fetch(`/api/playlists/${encodeURIComponent(playlistId)}`);
    if (fresh.ok) currentPlaylist = await fresh.json();
    renderPlaylistEditor();
  }

  document.getElementById('swipe-close-btn').addEventListener('click', closeSwipePicker);
  document.getElementById('swipe-add-btn').addEventListener('click', () => handleSwipeAction('right'));
  document.getElementById('swipe-skip-btn').addEventListener('click', () => handleSwipeAction('left'));

  if (deck.length === 0) {
    showSwipeEndState();
  } else {
    renderTopCards();
  }
}

function sectionSongs(sectionIdx) {
  const section = currentPlaylist.sections[sectionIdx];
  if (!section.songs) section.songs = [];
  return section.songs;
}

function serialiseSections() {
  return currentPlaylist.sections.map(s => ({
    name: s.name,
    songs: (s.songs || []).map(e => ({ id: e.id, key: e.key || null, tempo: e.tempo || null, notes: e.notes || null })),
  }));
}

function addSongToSection(sectionIdx, songId) {
  sectionSongs(sectionIdx).push({ id: songId, key: null, tempo: null, notes: null });
  refreshEditor();
}

function removeSongFromSection(sectionIdx, songIdx) {
  sectionSongs(sectionIdx).splice(songIdx, 1);
  refreshEditor();
}

function moveSong(sectionIdx, songIdx, direction) {
  const arr = sectionSongs(sectionIdx);
  const newIdx = songIdx + direction;
  if (newIdx < 0 || newIdx >= arr.length) return;
  [arr[songIdx], arr[newIdx]] = [arr[newIdx], arr[songIdx]];
  refreshEditor();
}

async function refreshEditor() {
  await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sections: serialiseSections() }),
  });
  const res2 = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`);
  if (res2.ok) currentPlaylist = await res2.json();
  renderPlaylistEditor();
}

async function savePlaylist() {
  const name = document.getElementById('edit-name').value.trim();
  const date = document.getElementById('edit-date').value || null;
  const theme = document.getElementById('edit-theme').value || null;
  const bibleLessonsRaw = document.getElementById('edit-bible-lessons').value.trim();
  const bibleLessons = bibleLessonsRaw ? bibleLessonsRaw.split('\n').map(s => s.trim()).filter(Boolean).join(', ') : null;
  const googleDoc = document.getElementById('edit-google-doc').value || null;
  const notes = document.getElementById('edit-notes').value || null;

  if (!name) { alert('Please enter a playlist name.'); return; }

  const res = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      date,
      theme,
      bibleLessons,
      googleDoc,
      notes,
      sections: serialiseSections(),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Failed to save playlist');
    return;
  }

  currentPlaylist = await res.json();
  // Re-fetch with resolved songs
  const res2 = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`);
  if (res2.ok) currentPlaylist = await res2.json();
  renderPlaylistEditor();
  showToast('Playlist saved!');
}

async function deletePlaylist() {
  const res = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 204) {
    alert('Failed to delete playlist');
    return;
  }

  currentPlaylist = null;
  showPlaylistListView();
}

// === Playlist Display ===

displayBackBtn.addEventListener('click', showPlaylistListView);

async function openPlaylistDisplay(id) {
  const res = await fetch(`/api/playlists/${encodeURIComponent(id)}`);
  if (!res.ok) return;
  const playlist = await res.json();

  playlistListView.classList.add('hidden');
  playlistEditorView.classList.add('hidden');
  playlistDisplayView.classList.remove('hidden');

  renderPlaylistDisplay(playlist);
}

function renderPlaylistDisplay(playlist) {
  const themeHtml = playlist.theme
    ? `<div class="display-description"><strong>Theme:</strong> ${escapeHtml(playlist.theme)}</div>`
    : '';
  const bibleLessonsHtml = playlist.bibleLessons
    ? `<div class="display-description"><strong>Bible Lessons:</strong> ${escapeHtml(playlist.bibleLessons)}</div>`
    : '';
  const googleDocHtml = playlist.googleDoc
    ? `<div class="display-description"><strong>Song Sheet:</strong> <a href="${escapeHtml(playlist.googleDoc)}" target="_blank" rel="noopener">View Google Doc</a></div>`
    : '';
  const notesHtml = playlist.notes
    ? `<div class="display-notes">${escapeHtml(playlist.notes)}</div>`
    : '';

  let sectionsHtml = '';
  for (const section of playlist.sections) {
    const songs = section.songs || [];
    let songsHtml = '';
    if (songs.length === 0) {
      songsHtml = '<div class="display-section-empty">No songs</div>';
    } else {
      songsHtml = songs.map(song => {
        if (song.notFound) {
          return `<div class="display-song"><span class="display-song-not-found">${escapeHtml(song.id)} (not found)</span></div>`;
        }
        const lyricsContent = song.lyrics
          ? song.lyrics.map(s => s.lines.join('<br>')).join('<br><br>')
          : '';
        const metaParts = [];
        if (song.key) metaParts.push(`Key: ${escapeHtml(song.key)}`);
        if (song.tempo) metaParts.push(`Tempo: ${escapeHtml(song.tempo)}`);
        const metaHtml = metaParts.length
          ? `<div class="display-song-meta">${metaParts.join(' &nbsp;|&nbsp; ')}</div>`
          : '';
        const songNotesHtml = song.notes
          ? `<div class="display-song-notes">${escapeHtml(song.notes)}</div>`
          : '';
        return `<div class="display-song">
          <span class="display-song-title">${escapeHtml(song.title || 'Untitled')}</span>
          ${metaHtml}
          ${songNotesHtml}
          ${lyricsContent ? `<div class="display-song-lyrics">${lyricsContent}</div>` : ''}
        </div>`;
      }).join('');
    }

    sectionsHtml += `
      <div class="display-section">
        <div class="display-section-name">${escapeHtml(section.name)}</div>
        ${songsHtml}
      </div>
    `;
  }

  playlistDisplayEl.innerHTML = `
    <div class="display-container">
      <div class="display-header">
        <h2>${escapeHtml(playlist.name)}</h2>
        <div class="display-meta">
          <span>${escapeHtml(getServiceTypeName(playlist.type))}</span>
          ${playlist.date ? `<span>${formatDisplayDate(playlist.date)}</span>` : ''}
        </div>
      </div>
      ${themeHtml}
      ${bibleLessonsHtml}
      ${googleDocHtml}
      ${notesHtml}
      <div class="display-controls">
        <label><input type="checkbox" id="show-lyrics-toggle" checked> Show Lyrics</label>
      </div>
      ${sectionsHtml}
      <div class="display-bottom-actions">
        <button class="btn btn-secondary" id="display-export-doc-btn">Export Doc</button>
        <button class="btn btn-secondary" id="display-go-back-btn">Go Back</button>
      </div>
    </div>
  `;

  document.getElementById('show-lyrics-toggle').addEventListener('change', (e) => {
    playlistDisplayEl.querySelectorAll('.display-song-lyrics').forEach(el => {
      el.classList.toggle('hidden', !e.target.checked);
    });
  });

  document.getElementById('display-export-doc-btn').addEventListener('click', () => {
    window.location.href = `/api/playlists/${encodeURIComponent(playlist.id)}/export`;
  });

  document.getElementById('display-go-back-btn').addEventListener('click', () => {
    openPlaylistEditor(playlist.id);
  });
}

// === Auth / User Info ===
async function initUserInfo() {
  try {
    const res = await fetch('/auth/me');
    if (!res.ok) return; // not signed in — show nothing
    const user = await res.json();
    const userInfoEl = document.getElementById('user-info');
    if (userInfoEl) {
      userInfoEl.innerHTML =
        (user.picture ? `<img src="${escapeHtml(user.picture)}" alt="" class="user-avatar" referrerpolicy="no-referrer">` : '') +
        `<span class="user-name">${escapeHtml(user.name || user.email)}</span>` +
        `<a href="/auth/logout" class="btn btn-sm btn-secondary sign-out-btn">Sign out</a>`;
    }
  } catch (_) {
    // silently ignore network errors
  }
}

// Redirect to login on any 401 API response
async function apiFetch(url, options) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/login.html';
    return null;
  }
  return res;
}

// === Init ===
initUserInfo();
loadServiceTypes();
showHome();
