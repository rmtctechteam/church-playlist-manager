// === DOM Elements ===
const searchInput = document.getElementById('search-input');
const songList = document.getElementById('song-list');
const songListView = document.getElementById('song-list-view');
const songDetailView = document.getElementById('song-detail-view');
const songDetail = document.getElementById('song-detail');
const backBtn = document.getElementById('back-btn');

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

let debounceTimer = null;
let serviceTypes = [];

// === Utility ===
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === Tab Navigation ===
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    songsTab.classList.toggle('hidden', target !== 'songs');
    playlistsTab.classList.toggle('hidden', target !== 'playlists');
    if (target === 'playlists') loadPlaylistList();
  });
});

// === Songs Tab ===
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

async function renderSongDetail(song) {
  const metaHtml = `
    <h2>${escapeHtml(song.title || 'Untitled')}</h2>
    <div class="song-meta">
      <span><strong>Artist:</strong> ${escapeHtml(song.artist || 'Unknown')}</span>
      ${song.key ? `<span><strong>Key:</strong> ${escapeHtml(song.key)}</span>` : ''}
      ${song.tempo ? `<span><strong>Tempo:</strong> ${escapeHtml(song.tempo)}</span>` : ''}
    </div>
  `;

  // Fetch usage info
  let usageHtml = '';
  try {
    const res = await fetch(`/api/songs/${encodeURIComponent(song.id)}/usage`);
    const usage = await res.json();
    if (usage.count > 0) {
      usageHtml = `<div class="usage-info">Used <strong>${usage.count}</strong> time${usage.count !== 1 ? 's' : ''} &middot; Last used: ${usage.lastUsed}</div>`;
    } else {
      usageHtml = `<div class="usage-info">Not yet used in any playlist</div>`;
    }
  } catch (_) { /* ignore usage fetch errors */ }

  const lyricsHtml = song.lyrics.map(section => `
    <div class="lyrics-section">
      <p>${section.lines.map(escapeHtml).join('<br>')}</p>
    </div>
  `).join('');

  songDetail.innerHTML = metaHtml + usageHtml + '<div class="lyrics">' + lyricsHtml + '</div>';
}

async function showSongDetail(id) {
  const song = await fetchSongDetail(id);
  if (!song) return;
  await renderSongDetail(song);
  songListView.classList.add('hidden');
  songDetailView.classList.remove('hidden');
}

function showSongList() {
  songDetailView.classList.add('hidden');
  songListView.classList.remove('hidden');
}

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const songs = await fetchSongs(searchInput.value.trim());
    renderSongList(songs);
  }, 200);
});

backBtn.addEventListener('click', showSongList);

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
  const songCount = playlist.sections.reduce((sum, s) => sum + s.songIds.length, 0);
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
  openPlaylistEditor(playlist.id);
}

async function openPlaylistEditor(id) {
  const res = await fetch(`/api/playlists/${encodeURIComponent(id)}`);
  if (!res.ok) return;
  currentPlaylist = await res.json();

  playlistListView.classList.add('hidden');
  playlistDisplayView.classList.add('hidden');
  playlistEditorView.classList.remove('hidden');

  renderPlaylistEditor();
}

function renderPlaylistEditor() {
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
        return `<div class="section-song-item">
          <span class="song-info">
            ${escapeHtml(song.title || 'Untitled')}
            ${song.key ? `<span class="key-badge">(${escapeHtml(song.key)})</span>` : ''}
          </span>
          <span class="song-controls">
            <button class="btn-icon move-up-btn" data-section="${si}" data-song="${songIdx}" ${songIdx === 0 ? 'disabled' : ''}>&#9650;</button>
            <button class="btn-icon move-down-btn" data-section="${si}" data-song="${songIdx}" ${songIdx === songs.length - 1 ? 'disabled' : ''}>&#9660;</button>
            <button class="btn-icon remove-song-btn" data-section="${si}" data-song="${songIdx}">x</button>
          </span>
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
    <h2>Edit Playlist</h2>
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
            <label for="edit-theme">Theme</label>
            <input type="text" id="edit-theme" value="${escapeHtml(p.theme || '')}" placeholder="e.g., Grace and Forgiveness">
          </div>
          <div class="form-group">
            <label for="edit-bible-lessons">Bible Lessons</label>
            <input type="text" id="edit-bible-lessons" value="${escapeHtml(p.bibleLessons || '')}" placeholder="e.g., Romans 8:28, John 3:16">
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
        <h3 class="editor-main-heading">Songs</h3>
        ${sectionsHtml}
      </div>
    </div>
    <div class="editor-bottom-actions">
      <button class="btn btn-danger" id="delete-playlist-btn">Delete Playlist</button>
      <div class="editor-bottom-actions-right">
        <button class="btn btn-secondary" id="export-doc-btn">Export Doc</button>
        <button class="btn btn-secondary" id="display-from-editor-btn">Display</button>
        <button class="btn btn-primary" id="save-playlist-btn">Save</button>
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
            `<div class="song-search-result" data-id="${escapeHtml(s.id)}">${escapeHtml(s.title || 'Untitled')} <small style="color:var(--gray-400)">${escapeHtml(s.artist || '')}</small></div>`
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
}

function addSongToSection(sectionIdx, songId) {
  currentPlaylist.sections[sectionIdx].songIds.push(songId);
  // Re-resolve songs by refetching
  refreshEditor();
}

function removeSongFromSection(sectionIdx, songIdx) {
  currentPlaylist.sections[sectionIdx].songIds.splice(songIdx, 1);
  refreshEditor();
}

function moveSong(sectionIdx, songIdx, direction) {
  const ids = currentPlaylist.sections[sectionIdx].songIds;
  const newIdx = songIdx + direction;
  if (newIdx < 0 || newIdx >= ids.length) return;
  [ids[songIdx], ids[newIdx]] = [ids[newIdx], ids[songIdx]];
  refreshEditor();
}

async function refreshEditor() {
  // Re-fetch to get resolved songs
  const res = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`);
  if (res.ok) {
    // Merge local songIds changes first by saving, then re-fetching
    await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sections: currentPlaylist.sections.map(s => ({ name: s.name, songIds: s.songIds })),
      }),
    });
    const res2 = await fetch(`/api/playlists/${encodeURIComponent(currentPlaylist.id)}`);
    if (res2.ok) currentPlaylist = await res2.json();
  }
  renderPlaylistEditor();
}

async function savePlaylist() {
  const name = document.getElementById('edit-name').value.trim();
  const date = document.getElementById('edit-date').value || null;
  const theme = document.getElementById('edit-theme').value || null;
  const bibleLessons = document.getElementById('edit-bible-lessons').value || null;
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
      sections: currentPlaylist.sections.map(s => ({ name: s.name, songIds: s.songIds })),
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
  alert('Playlist saved!');
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
    ? `<div class="display-description"><strong>Song Sheet Google Doc:</strong> <a href="${escapeHtml(playlist.googleDoc)}" target="_blank" rel="noopener">${escapeHtml(playlist.googleDoc)}</a></div>`
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
        return `<div class="display-song">
          <span class="display-song-title">${escapeHtml(song.title || 'Untitled')}</span>
          ${song.key ? `<span class="display-song-key">${escapeHtml(song.key)}</span>` : ''}
          ${lyricsContent ? `<div class="display-song-lyrics hidden">${lyricsContent}</div>` : ''}
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
          ${playlist.date ? `<span>${playlist.date}</span>` : ''}
        </div>
      </div>
      ${themeHtml}
      ${bibleLessonsHtml}
      ${googleDocHtml}
      ${notesHtml}
      <div class="display-controls">
        <label><input type="checkbox" id="show-lyrics-toggle"> Show Lyrics</label>
      </div>
      ${sectionsHtml}
    </div>
  `;

  document.getElementById('show-lyrics-toggle').addEventListener('change', (e) => {
    playlistDisplayEl.querySelectorAll('.display-song-lyrics').forEach(el => {
      el.classList.toggle('hidden', !e.target.checked);
    });
  });
}

// === Init ===
fetchSongs().then(renderSongList);
loadServiceTypes().then(() => loadPlaylistList());
