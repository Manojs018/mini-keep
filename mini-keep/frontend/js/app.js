const API_URL = 'http://localhost:5000/api';
const user = JSON.parse(localStorage.getItem('user'));
let notes = [];
let selectedColor = '#ffffff';
let editSelectedColor = '#ffffff';
let currentView = 'notes';

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

// Load Notes
async function fetchNotes() {
    try {
        const res = await fetch(`${API_URL}/notes?view=${currentView}`, authHeader);
        const data = await res.json();
        if (res.ok) {
            notes = data;
            renderNotes(notes);
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

// Render Notes
function renderNotes(notesToRender) {
    notesGrid.innerHTML = '';

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
      <p>${escapeHTML(note.description)}</p>
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

    if (!title && !description) {
        alert('Please add a title or note');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            ...authHeader,
            body: JSON.stringify({ title, description, color: selectedColor }),
        });

        if (res.ok) {
            // Reset form
            document.getElementById('note-title').value = '';
            document.getElementById('note-desc').value = '';
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

    try {
        const res = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PUT',
            ...authHeader,
            body: JSON.stringify({ title, description, color: editSelectedColor })
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
