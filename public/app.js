// Базовый URL API
const API_URL = '/api/notes';

// Элементы DOM
const noteForm = document.getElementById('note-form');
const notesContainer = document.getElementById('notes-container');
const notesCount = document.getElementById('notes-count');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const clearSearchBtn = document.getElementById('clear-search');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const cancelEditBtn = document.getElementById('cancel-edit');

// Текущий список заметок (для быстрого поиска на клиенте)
let allNotes = [];

// Загрузка заметок при запуске
document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  
  // Добавляем поиск по нажатию Enter
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchNotes();
    }
  });
});

// Создание заметки
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('note-title').value.trim();
  const content = document.getElementById('note-content').value.trim();
  
  if (!title || !content) {
    showMessage('Заполните все поля', 'error');
    return;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ title, content })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка создания');
    }
    
    noteForm.reset();
    await loadNotes(); // Перезагружаем все заметки
    showMessage('Заметка создана!', 'success');
  } catch (error) {
    console.error('Ошибка создания:', error);
    showMessage(error.message || 'Ошибка при создании заметки', 'error');
  }
});

// Поиск заметок (клиентский поиск для скорости)
searchBtn.addEventListener('click', searchNotes);

// Функция поиска
function searchNotes() {
  const query = searchInput.value.trim();
  
  if (!query) {
    renderNotes(allNotes);
    return;
  }
  
  const searchTerm = query.toLowerCase();
  const filteredNotes = allNotes.filter(note => {
    const titleMatch = note.title && note.title.toLowerCase().includes(searchTerm);
    const contentMatch = note.content && note.content.toLowerCase().includes(searchTerm);
    return titleMatch || contentMatch;
  });
  
  renderNotes(filteredNotes);
}

// Сброс поиска
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  renderNotes(allNotes);
});

// Закрытие модального окна
cancelEditBtn.addEventListener('click', () => {
  editModal.style.display = 'none';
  editForm.reset();
});

// Редактирование заметки
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value.trim();
  const content = document.getElementById('edit-content').value.trim();
  
  if (!title || !content) {
    showMessage('Заполните все поля', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ title, content })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка обновления');
    }
    
    editModal.style.display = 'none';
    editForm.reset();
    await loadNotes(); // Перезагружаем все заметки
    showMessage('Заметка обновлена!', 'success');
  } catch (error) {
    console.error('Ошибка обновления:', error);
    showMessage(error.message || 'Ошибка при обновлении заметки', 'error');
  }
});

// Загрузка всех заметок с сервера
async function loadNotes() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки');
    }
    
    allNotes = await response.json();
    renderNotes(allNotes);
  } catch (error) {
    console.error('Ошибка загрузки заметок:', error);
    notesContainer.innerHTML = '<p class="empty">Ошибка загрузки заметок. Проверьте консоль сервера.</p>';
    notesCount.textContent = '(0)';
  }
}

// Отображение заметок
function renderNotes(notes) {
  notesCount.textContent = `(${notes.length})`;
  
  if (notes.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list fa-3x"></i>
        <p>${searchInput.value ? 'По запросу ничего не найдено' : 'Заметок пока нет. Создайте первую!'}</p>
      </div>
    `;
    return;
  }
  
  notesContainer.innerHTML = notes.map(note => `
    <div class="note" data-id="${note.id}">
      <div class="note-header">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <div class="note-actions">
          <button class="btn edit-btn" onclick="openEditModal(${note.id})">
            <i class="fas fa-edit"></i> Изменить
          </button>
          <button class="btn btn-secondary" onclick="deleteNote(${note.id})">
            <i class="fas fa-trash"></i> Удалить
          </button>
        </div>
      </div>
      <div class="note-content">${escapeHtml(note.content)}</div>
      <div class="note-meta">
        <span><i class="far fa-calendar-plus"></i> ${formatDate(note.createdAt)}</span>
        <span><i class="far fa-calendar-check"></i> ${formatDate(note.updatedAt)}</span>
      </div>
    </div>
  `).join('');
}

// Открытие модального окна для редактирования
window.openEditModal = async function(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки заметки');
    }
    
    const note = await response.json();
    
    document.getElementById('edit-id').value = note.id;
    document.getElementById('edit-title').value = note.title;
    document.getElementById('edit-content').value = note.content;
    
    editModal.style.display = 'flex';
  } catch (error) {
    console.error('Ошибка загрузки заметки:', error);
    showMessage('Ошибка загрузки заметки для редактирования', 'error');
  }
};

// Удаление заметки
window.deleteNote = async function(id) {
  if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка удаления');
    }
    
    // Удаляем из локального массива
    allNotes = allNotes.filter(note => note.id !== id);
    
    // Обновляем отображение
    renderNotes(allNotes);
    
    showMessage('Заметка удалена!', 'success');
  } catch (error) {
    console.error('Ошибка удаления:', error);
    showMessage(error.message || 'Ошибка при удалении заметки', 'error');
  }
};

// Вспомогательные функции
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'дата неизвестна';
  }
}

function showMessage(text, type = 'info') {
  // Создаём временное уведомление
  const message = document.createElement('div');
  message.className = `message message-${type}`;
  message.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${text}
  `;
  
  // Стили для сообщения
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#48bb78' : '#f56565'};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(message);
  
  // Удаляем через 3 секунды
  setTimeout(() => {
    message.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Добавляем стили для анимации сообщений
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 50px 20px;
    color: #a0aec0;
  }
  
  .empty-state i {
    margin-bottom: 20px;
    color: #cbd5e0;
  }
`;
document.head.appendChild(style);