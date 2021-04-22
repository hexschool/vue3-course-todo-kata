import { createApp } from './node_modules/vue/dist/vue.esm-browser.js';

const STORAGE_KEY = 'todos-vuejs-2.0';
const todoStorage = {
  fetch() {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    todos.forEach(function (todo, index) {
      todo.id = index;
    });
    todoStorage.uid = todos.length;
    return todos;
  },
  save(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
  uid: 0
};

// visibility filters
const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter((todo) => !todo.completed),
  completed: (todos) => todos.filter((todo) => todo.completed),
};

// app Vue instance
const app = createApp({
  data() {
    return {
      a: 'vDVb',
      visibility: 'all'
    };
  },
  setup: function () {
    
  },

  directives: {
    'todo-focus': {
      updated(el, binding) {
        if (binding.value) {
          el.focus();
        }
      },
    },
  },
});

// mount
app.mount('.todoapp');
