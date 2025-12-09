const express = require('express');
const path = require('path');
const notesRoutes = require('./src/routes/notesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для обработки JSON
app.use(express.json());

// Middleware для обработки URL-encoded данных
app.use(express.urlencoded({ extended: true }));

// Раздача статических файлов (фронтенд)
app.use(express.static(path.join(__dirname, 'public')));

// Кастомный middleware для логирования
const logger = require('./src/middleware/logger');
app.use(logger);

// Подключение API маршрутов
app.use('/api/notes', notesRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Страница не найдена' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`👉 Откройте: http://localhost:${PORT}`);
  console.log('📝 Приложение "Список заметок" готово!');
});