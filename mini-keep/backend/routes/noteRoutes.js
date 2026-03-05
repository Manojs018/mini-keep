const express = require('express');
const router = express.Router();
const {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    pinNote,
    archiveNote,
    trashNote,
    getLabels
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/labels').get(protect, getLabels);
router.route('/:id').put(protect, updateNote).delete(protect, deleteNote);
router.route('/pin/:id').put(protect, pinNote);
router.route('/archive/:id').put(protect, archiveNote);
router.route('/trash/:id').put(protect, trashNote);

module.exports = router;
