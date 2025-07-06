// Select DOM elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// Retrieve todos from localStorage or return empty array
function getTodos() {
    return JSON.parse(localStorage.getItem('todos') || '[]');
}

// Save todos array to localStorage
function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Render todos on the page
function renderTodos() {
    const todos = getTodos();
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'completed' : '';
        li.innerHTML = `
            <span class="todo-text">${todo.text}</span>
            <div>
                <button class="delete-btn" data-index="${index}" title="Delete">&#10006;</button>
            </div>
        `;
        li.addEventListener('click', function(e) {
            // Prevent toggling completed when clicking delete button
            if (e.target.classList.contains('delete-btn')) return;
            toggleCompleted(index);
        });
        todoList.appendChild(li);
    });
}

// Add a new todo
todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text === '') return;
    const todos = getTodos();
    todos.push({ text, completed: false });
    saveTodos(todos);
    todoInput.value = '';
    renderTodos();
});

// Delete or mark as completed
todoList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const index = e.target.getAttribute('data-index');
        deleteTodo(index);
    }
});

// Mark todo as completed/uncompleted
function toggleCompleted(index) {
    const todos = getTodos();
    todos[index].completed = !todos[index].completed;
    saveTodos(todos);
    renderTodos();
}

// Delete a todo
function deleteTodo(index) {
    const todos = getTodos();
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos();
}

// Initial render
renderTodos();