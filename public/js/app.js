const API_URL = '/api';
const user = JSON.parse(localStorage.getItem('user'));
let notes = [];
let selectedColor = '#ffffff';
let editSelectedColor = '#ffffff';
let currentView = 'notes';
let selectedLabel = null;

// Set marked options
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,
        gfm: true
    });
}

// Auth Header
const authHeader = {
    headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
    },
};

// DOM Elements
const notesGrid = document.getElementById('notes-grid');
const addNoteForm = document.getElementById('add-note-form');
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.getElementById('search-input');
const colorOptions = document.querySelectorAll('.color-option:not(.edit-color-option)');
const editColorOptions = document.querySelectorAll('.edit-color-option');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const labelsList = document.getElementById('labels-list');
const viewTitle = document.getElementById('view-title');
const addNoteContainer = document.querySelector('.add-note-container');

// Color Picker Logic
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedColor = option.dataset.color;
        document.querySelector('.add-note-container').style.backgroundColor = selectedColor;
    });
});

// Edit Color Picker Logic
editColorOptions.forEach(option => {
    option.addEventListener('click', () => {
        editColorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        editSelectedColor = option.dataset.color;
        document.querySelector('.modal-content').style.backgroundColor = editSelectedColor;
    });
});

// Sidebar Logic
sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentView = item.dataset.view;
        selectedLabel = null; // Reset label filter when clicking main views

        // Update UI based on view
        if (currentView === 'notes') {
            viewTitle.style.display = 'none';
            addNoteContainer.style.display = 'block';
        } else {
            viewTitle.innerText = currentView.charAt(0).toUpperCase() + currentView.slice(1);
            viewTitle.style.display = 'block';
            addNoteContainer.style.display = 'none';
        }

        fetchNotes();
    });
});

// Load Labels for Sidebar
async function fetchLabels() {
    try {
        const res = await fetch(`${API_URL}/notes/labels`, authHeader);
        const data = await res.json();
        if (res.ok) {
            renderLabelsSidebar(data);
        }
    } catch (error) {
        console.error('Error fetching labels:', error);
    }
}

function renderLabelsSidebar(labels) {
    labelsList.innerHTML = '';
    labels.forEach(label => {
        const labelEl = document.createElement('div');
        labelEl.classList.add('sidebar-label-item');
        if (selectedLabel === label) labelEl.classList.add('active');
        labelEl.innerHTML = `<i class="fas fa-tag"></i> ${escapeHTML(label)}`;
        labelEl.onclick = () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.sidebar-label-item').forEach(i => i.classList.remove('active'));
            labelEl.classList.add('active');

            selectedLabel = label;
            currentView = 'notes'; // Labels are viewed in "Notes" context

            viewTitle.innerText = label;
            viewTitle.style.display = 'block';
            addNoteContainer.style.display = 'none';

            fetchNotes();
        };
        labelsList.appendChild(labelEl);
    });
}

// Load Notes
async function fetchNotes() {
    try {
        let url = `${API_URL}/notes?view=${currentView}`;
        if (selectedLabel) url += `&label=${encodeURIComponent(selectedLabel)}`;

        const res = await fetch(url, authHeader);
        const data = await res.json();
        if (res.ok) {
            notes = data;
            renderNotes(notes);
            fetchLabels(); // Refresh labels in sidebar as well
        } else {
            if (res.status === 401) logout();
        }
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}

// Helper to escape HTML characters
function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function (m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

// Helper for Markdown rendering with sanitization
function parseMarkdown(text) {
    if (!text) return "";
    try {
        // Using marked.parse for newer versions of marked
        const rawHtml = marked.parse(text);
        return DOMPurify.sanitize(rawHtml);
    } catch (e) {
        console.error("Markdown parse error:", e);
        return escapeHTML(text);
    }
}

// Render Notes
function renderNotes(notesToRender) {
    notesGrid.innerHTML = '';

    if (!Array.isArray(notesToRender)) {
        console.error("renderNotes expected an array but received:", notesToRender);
        return;
    }

    if (notesToRender.length === 0) {
        let emptyMsg = "No notes found. Add one!";
        if (currentView === 'archive') emptyMsg = "Your archived notes appear here.";
        if (currentView === 'trash') emptyMsg = "No notes in Trash.";

        notesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #777; margin-top: 2rem;">${emptyMsg}</p>`;
        return;
    }

    notesToRender.forEach((note) => {
        const noteEl = document.createElement('div');
        noteEl.classList.add('note-card');
        noteEl.style.backgroundColor = note.color;

        const date = new Date(note.createdAt).toLocaleDateString();

        let actionButtons = '';
        if (currentView === 'trash') {
            actionButtons = `
                <button class="action-btn" title="Restore" onclick="trashNote('${note._id}')"><i class="fas fa-undo"></i></button>
                <button class="action-btn" title="Delete Permanently" onclick="deleteNotePermanently('${note._id}')"><i class="fas fa-trash-alt"></i></button>
            `;
        } else if (currentView === 'archive') {
            actionButtons = `
                <button class="action-btn" title="Unarchive" onclick="archiveNote('${note._id}')"><i class="fas fa-upload"></i></button>
                <button class="action-btn" title="Trash" onclick="trashNote('${note._id}')"><i class="fas fa-trash"></i></button>
            `;
        } else {
            actionButtons = `
                <button class="action-btn" title="Edit" onclick="openEditModal('${note._id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn" title="Archive" onclick="archiveNote('${note._id}')"><i class="fas fa-archive"></i></button>
                <button class="action-btn" title="Trash" onclick="trashNote('${note._id}')"><i class="fas fa-trash"></i></button>
            `;
        }

        noteEl.innerHTML = `
      <div class="note-title">${escapeHTML(note.title)}</div>
      <div class="note-description">${parseMarkdown(note.description)}</div>
      
      ${note.labels && note.labels.length > 0 ? `
      <div class="note-labels">
          ${note.labels.map(label => `<span class="label-chip">${escapeHTML(label)}</span>`).join('')}
      </div>` : ''}

      <div class="note-footer">
          <span>${date}</span>
          <div class="note-actions">
              ${actionButtons}
          </div>
      </div>
      ${currentView === 'notes' ? `
      <button class="pin-btn ${note.pinned ? 'active' : ''}" onclick="togglePin('${note._id}')">
          <i class="fas fa-thumbtack"></i>
      </button>` : ''}
    `;
        notesGrid.appendChild(noteEl);
    });
}

// Add Note
addNoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('note-title').value;
    const description = document.getElementById('note-desc').value;
    const labelsRaw = document.getElementById('note-labels').value;
    const labels = labelsRaw ? labelsRaw.split(',').map(l => l.trim()).filter(l => l !== '') : [];

    if (!title && !description) {
        alert('Please add a title or note');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            ...authHeader,
            body: JSON.stringify({ title, description, color: selectedColor, labels }),
        });

        if (res.ok) {
            // Reset form
            document.getElementById('note-title').value = '';
            document.getElementById('note-desc').value = '';
            document.getElementById('note-labels').value = '';
            selectedColor = '#ffffff';
            document.querySelector('.add-note-container').style.backgroundColor = '#ffffff';
            colorOptions.forEach(opt => opt.classList.remove('selected'));

            // Refresh notes
            fetchNotes();
        }
    } catch (error) {
        console.error('Error creating note:', error);
    }
});

// Delete Note Permanently
window.deleteNotePermanently = async (id) => {
    if (!confirm('Delete permanently? This cannot be undone.')) return;

    try {
        const res = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            ...authHeader
        });

        if (res.ok) fetchNotes();
    } catch (error) {
        console.error(error);
    }
};

// Toggle Archive
window.archiveNote = async (id) => {
    try {
        const res = await fetch(`${API_URL}/notes/archive/${id}`, {
            method: 'PUT',
            ...authHeader
        });

        if (res.ok) fetchNotes();
    } catch (error) {
        console.error(error);
    }
}

// Toggle Trash
window.trashNote = async (id) => {
    try {
        const res = await fetch(`${API_URL}/notes/trash/${id}`, {
            method: 'PUT',
            ...authHeader
        });

        if (res.ok) fetchNotes();
    } catch (error) {
        console.error(error);
    }
}

// Toggle Pin
window.togglePin = async (id) => {
    try {
        const res = await fetch(`${API_URL}/notes/pin/${id}`, {
            method: 'PUT',
            ...authHeader
        });

        if (res.ok) fetchNotes();
    } catch (error) {
        console.error(error);
    }
}

// Modal Logic
const modal = document.getElementById('edit-modal');
const closeModal = document.querySelector('.close');
const editForm = document.getElementById('edit-note-form');

window.openEditModal = (id) => {
    const note = notes.find(n => n._id === id);
    if (note) {
        document.getElementById('edit-id').value = note._id;
        document.getElementById('edit-title').value = note.title;
        document.getElementById('edit-desc').value = note.description;
        document.getElementById('edit-labels').value = note.labels ? note.labels.join(', ') : '';
        editSelectedColor = note.color || '#ffffff';

        // Select the color in modal
        editColorOptions.forEach(opt => {
            if (opt.dataset.color === editSelectedColor) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        document.querySelector('.modal-content').style.backgroundColor = editSelectedColor;

        modal.style.display = 'block';
    }
};

closeModal.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-desc').value;
    const labelsRaw = document.getElementById('edit-labels').value;
    const labels = labelsRaw ? labelsRaw.split(',').map(l => l.trim()).filter(l => l !== '') : [];

    try {
        const res = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PUT',
            ...authHeader,
            body: JSON.stringify({ title, description, color: editSelectedColor, labels })
        });

        if (res.ok) {
            modal.style.display = 'none';
            fetchNotes();
        }
    } catch (error) {
        console.error(error);
    }
});


// Search
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(term) ||
        note.description.toLowerCase().includes(term)
    );
    renderNotes(filteredNotes);
});


// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

logoutBtn.addEventListener('click', logout);

// Initial Load
fetchNotes();
