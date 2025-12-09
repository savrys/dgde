const fs = require('fs').promises;
const path = require('path');

const notesFilePath = path.join(__dirname, '../data/notes.json');

// Чтение заметок из файла
const readNotesFromFile = async () => {
  try {
    const data = await fs.readFile(notesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Если файла нет, создаём пустой массив
    return [];
  }
};

// Запись заметок в файл
const writeNotesToFile = async (notes) => {
  await fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2));
};

// Получить все заметки
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await readNotesFromFile();
    res.json(notes);
  } catch (error) {
    console.error('Ошибка при получении заметок:', error);
    res.status(500).json({ error: 'Ошибка при получении заметок' });
  }
};

// Получить заметку по ID
exports.getNoteById = async (req, res) => {
  try {
    const notes = await readNotesFromFile();
    const noteId = parseInt(req.params.id);
    
    // Проверяем, что ID - число
    if (isNaN(noteId)) {
      return res.status(400).json({ error: 'Некорректный ID заметки' });
    }
    
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ error: 'Заметка не найдена' });
    }
  } catch (error) {
    console.error('Ошибка при получении заметки:', error);
    res.status(500).json({ error: 'Ошибка при получении заметки' });
  }
};

// ПОИСК ЗАМЕТОК - ИСПРАВЛЕННАЯ ВЕРСИЯ
exports.searchNotes = async (req, res) => {
  try {
    const query = req.query.q;
    
    // Если query не передан, возвращаем все заметки
    if (!query || query.trim() === '') {
      const notes = await readNotesFromFile();
      return res.json(notes);
    }
    
    const searchTerm = query.toLowerCase().trim();
    const notes = await readNotesFromFile();
    
    // Фильтруем заметки по заголовку и содержанию
    const filteredNotes = notes.filter(note => {
      const titleMatch = note.title && note.title.toLowerCase().includes(searchTerm);
      const contentMatch = note.content && note.content.toLowerCase().includes(searchTerm);
      return titleMatch || contentMatch;
    });
    
    res.json(filteredNotes);
  } catch (error) {
    console.error('Ошибка при поиске заметок:', error);
    res.status(500).json({ error: 'Ошибка при поиске заметок' });
  }
};

// Создать новую заметку
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Название и содержание обязательны' });
    }
    
    const notes = await readNotesFromFile();
    
    // Генерируем новый ID
    const newId = notes.length > 0 
      ? Math.max(...notes.map(n => n.id)) + 1 
      : 1;
    
    const newNote = {
      id: newId,
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    notes.push(newNote);
    await writeNotesToFile(notes);
    
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Ошибка при создании заметки:', error);
    res.status(500).json({ error: 'Ошибка при создании заметки' });
  }
};

// Обновить заметку
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const noteId = parseInt(id);
    if (isNaN(noteId)) {
      return res.status(400).json({ error: 'Некорректный ID заметки' });
    }
    
    const notes = await readNotesFromFile();
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Заметка не найдена' });
    }

    // Обновляем только переданные поля
    const updatedNote = {
      ...notes[noteIndex],
      title: title ? title.trim() : notes[noteIndex].title,
      content: content ? content.trim() : notes[noteIndex].content,
      updatedAt: new Date().toISOString()
    };

    notes[noteIndex] = updatedNote;
    await writeNotesToFile(notes);
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Ошибка при обновлении заметки:', error);
    res.status(500).json({ error: 'Ошибка при обновлении заметки' });
  }
};

// Удалить заметку
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const noteId = parseInt(id);
    
    if (isNaN(noteId)) {
      return res.status(400).json({ error: 'Некорректный ID заметки' });
    }
    
    const notes = await readNotesFromFile();
    const initialLength = notes.length;
    const filteredNotes = notes.filter(n => n.id !== noteId);
    
    if (filteredNotes.length === initialLength) {
      return res.status(404).json({ error: 'Заметка не найдена' });
    }

    await writeNotesToFile(filteredNotes);
    res.json({ 
      success: true, 
      message: 'Заметка успешно удалена',
      deletedId: noteId
    });
  } catch (error) {
    console.error('Ошибка при удалении заметки:', error);
    res.status(500).json({ error: 'Ошибка при удалении заметки' });
  }
};