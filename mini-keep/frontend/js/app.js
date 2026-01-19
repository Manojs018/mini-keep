const API_URL = 'http://localhost:5000/api';
const user = JSON.parse(localStorage.getItem('user'));
let notes = [];
let selectedColor = '#ffffff';

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
const colorOptions = document.querySelectorAll('.color-option');

// Color Picker Logic
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove selection from others
        colorOptions.forEach(opt => opt.style.border = '1px solid #ddd');
        // Select this one
        option.style.border = '2px solid #333';
        selectedColor = option.dataset.color;
        // Optional: change form background
        document.querySelector('.add-note-container').style.backgroundColor = selectedColor;
    });
});

// Load Notes
async function fetchNotes() {
    try {
        const res = await fetch(`${API_URL}/notes`, authHeader);
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

// Render Notes
function renderNotes(notesToRender) {
    notesGrid.innerHTML = '';

    if (notesToRender.length === 0) {
        notesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">No notes found. Add one!</p>';
        return;
    }

    notesToRender.forEach((note) => {
        const noteEl = document.createElement('div');
        noteEl.classList.add('note-card');
        noteEl.style.backgroundColor = note.color;

        // Formatting date
        const date = new Date(note.createdAt).toLocaleDateString();

        noteEl.innerHTML = `
      <div class="note-title">${note.title}</div>
      <p>${note.description}</p>
      <div class="note-footer">
          <span>${date}</span>
          <div class="note-actions">
              <button class="action-btn" onclick="openEditModal('${note._id}')"><i class="fas fa-edit"></i></button>
              <button class="action-btn" onclick="deleteNote('${note._id}')"><i class="fas fa-trash"></i></button>
          </div>
      </div>
      <button class="pin-btn ${note.pinned ? 'active' : ''}" onclick="togglePin('${note._id}')">
          <i class="fas fa-thumbtack"></i>
      </button>
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
            colorOptions.forEach(opt => opt.style.border = '1px solid #ddd');

            // Refresh notes
            fetchNotes();
        }
    } catch (error) {
        console.error('Error creating note:', error);
    }
});

// Delete Note
window.deleteNote = async (id) => {
    if (!confirm('Are you sure?')) return;

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
            body: JSON.stringify({ title, description })
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
