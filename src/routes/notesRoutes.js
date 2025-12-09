const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');

// GET /api/notes — все заметки
router.get('/', notesController.getAllNotes);

// GET /api/notes/:id — заметка по ID
router.get('/:id', notesController.getNoteById);

// GET /api/notes/search?q=текст — поиск заметок
router.get('/search', notesController.searchNotes);

// POST /api/notes — создать новую заметку
router.post('/', notesController.createNote);

// PUT /api/notes/:id — обновить заметку
router.put('/:id', notesController.updateNote);

// DELETE /api/notes/:id — удалить заметку
router.delete('/:id', notesController.deleteNote);

module.exports = router;