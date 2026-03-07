const Note = require('../models/Note');

// In-Memory Storage
let localNotes = [];

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    const { view, label } = req.query; // 'notes', 'archive', 'trash', and label filter

    let filter = { user: req.user.id };

    if (label) {
        filter.labels = label;
    }

    if (view === 'archive') {
        filter.isArchived = true;
        filter.isTrashed = false;
    } else if (view === 'trash') {
        filter.isTrashed = true;
    } else {
        // Main view or label view: hide archived and trashed unless explicitly in those views
        filter.isArchived = false;
        filter.isTrashed = false;
    }

    if (!global.dbConnected) {
        const userId = req.user.id || req.user._id;
        let notes = localNotes.filter(n => (n.user === userId));

        if (label) {
            notes = notes.filter(n => n.labels && n.labels.includes(label));
        }

        if (view === 'archive') {
            notes = notes.filter(n => n.isArchived && !n.isTrashed);
        } else if (view === 'trash') {
            notes = notes.filter(n => n.isTrashed);
        } else {
            notes = notes.filter(n => !n.isArchived && !n.isTrashed);
        }

        notes.sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));
        return res.status(200).json(notes);
    }

    const notes = await Note.find(filter).sort({ pinned: -1, createdAt: -1 });
    res.status(200).json(notes);
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, description, color, pinned, labels } = req.body;

    if (!title && !description) {
        return res.status(400).json({ message: 'Please add a title or description' });
    }

    if (!global.dbConnected) {
        const note = {
            _id: Date.now().toString(),
            title,
            description,
            color: color || '#ffffff',
            pinned: pinned || false,
            isArchived: false,
            isTrashed: false,
            labels: labels || [],
            user: req.user.id || req.user._id, // Handle mock ID format
            createdAt: new Date().toISOString()
        };
        localNotes.unshift(note);
        return res.status(200).json(note);
    }

    try {
        const note = await Note.create({
            title,
            description,
            color,
            pinned,
            labels,
            user: req.user.id,
        });
        res.status(200).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    if (!global.dbConnected) {
        const index = localNotes.findIndex(n => n._id === req.params.id);
        if (index === -1) return res.status(404).json({ message: 'Note not found' });

        // Update fields
        localNotes[index] = { ...localNotes[index], ...req.body };
        return res.status(200).json(localNotes[index]);
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }

    // Check for user
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the note user
    if (note.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    try {
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    if (!global.dbConnected) {
        localNotes = localNotes.filter(n => n._id !== req.params.id);
        return res.status(200).json({ id: req.params.id });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }

    // Check for user
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the note user
    if (note.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    await note.deleteOne();

    res.status(200).json({ id: req.params.id });
};

// @desc    Toggle pin status
// @route   PUT /api/notes/pin/:id
// @access  Private
const pinNote = async (req, res) => {
    if (!global.dbConnected) {
        const note = localNotes.find(n => n._id === req.params.id);
        if (note) {
            note.pinned = !note.pinned;
            return res.status(200).json(note);
        }
        return res.status(404).json({ message: 'Note not found' });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }

    // Check for user
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the note user
    if (note.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    try {
        note.pinned = !note.pinned;
        await note.save();

        res.status(200).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// @desc    Toggle archive status
// @route   PUT /api/notes/archive/:id
// @access  Private
const archiveNote = async (req, res) => {
    if (!global.dbConnected) {
        const note = localNotes.find(n => n._id === req.params.id);
        if (note) {
            note.isArchived = !note.isArchived;
            if (note.isArchived) note.pinned = false; // Unpin if archived
            return res.status(200).json(note);
        }
        return res.status(404).json({ message: 'Note not found' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    try {
        note.isArchived = !note.isArchived;
        if (note.isArchived) note.pinned = false;

        await note.save();
        res.status(200).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Toggle trash status
// @route   PUT /api/notes/trash/:id
// @access  Private
const trashNote = async (req, res) => {
    if (!global.dbConnected) {
        const note = localNotes.find(n => n._id === req.params.id);
        if (note) {
            note.isTrashed = !note.isTrashed;
            if (note.isTrashed) {
                note.pinned = false;
                note.isArchived = false;
            }
            return res.status(200).json(note);
        }
        return res.status(404).json({ message: 'Note not found' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    try {
        note.isTrashed = !note.isTrashed;
        if (note.isTrashed) {
            note.pinned = false;
            note.isArchived = false;
        }

        await note.save();
        res.status(200).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all unique labels for a user
// @route   GET /api/notes/labels
// @access  Private
const getLabels = async (req, res) => {
    if (!global.dbConnected) {
        const userId = req.user.id || req.user._id;
        const labels = [...new Set(localNotes
            .filter(n => n.user === userId)
            .flatMap(n => n.labels || [])
        )];
        return res.status(200).json(labels);
    }

    const labels = await Note.find({ user: req.user.id }).distinct('labels');
    res.status(200).json(labels);
};

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    pinNote,
    archiveNote,
    trashNote,
    getLabels
};
