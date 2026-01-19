const Note = require('../models/Note');

// In-Memory Storage
let localNotes = [];

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    if (!global.dbConnected) {
        // Filter by user and sort roughly (pinned first)
        const notes = localNotes.filter(n => n.user === req.user.id || n.user === req.user._id)
            .sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));
        return res.status(200).json(notes);
    }

    const notes = await Note.find({ user: req.user.id }).sort({ pinned: -1, createdAt: -1 }); // Pinned first, then newest
    res.status(200).json(notes);
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, description, color, pinned } = req.body;

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
            user: req.user.id || req.user._id, // Handle mock ID format
            createdAt: new Date().toISOString()
        };
        localNotes.unshift(note);
        return res.status(200).json(note);
    }

    const note = await Note.create({
        title,
        description,
        color,
        pinned,
        user: req.user.id,
    });

    res.status(200).json(note);
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

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedNote);
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

    note.pinned = !note.pinned;
    await note.save();

    res.status(200).json(note);
}

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    pinNote,
};
