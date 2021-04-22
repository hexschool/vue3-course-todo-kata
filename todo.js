import {createApp, reactive, ref, computed, onMounted} from './node_modules/vue/dist/vue.esm-browser.js';

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
    const todos = ref([]);
    const newTodo = ref('');
    const editedTodo = ref(null);
    const visibility = ref('all');

    // 區域變數
    let beforeEditCache = '';

    const filteredTodos = computed(() => filters[visibility.value](todos.value));
    const remaining = computed(() => filters.active(todos.value).length);
    const allDone = {
      get: () => remaining === 0,
      set: (value) => todos.value.forEach(todo => todo.completed = value)
    };

    onMounted(() => todos.value = todoStorage.fetch());

    function addTodo() {
      const value = newTodo.value && newTodo.value.trim();
      if (!value) {
        return;
      }
      todos.value.push({
        id: todoStorage.uid++,
        title: value,
        completed: false,
      });
      newTodo.value = '';
    }

    function pluralize(n) {
      return n === 1 ? 'item' : 'items';
    }

    function removeTodo(todo) {
      todos.value.splice(todos.value.indexOf(todo), 1);
    }

    function editTodo(todo) {
      beforeEditCache = todo.title;
      editedTodo.value = todo;
    }

    function doneEdit(todo) {
      if (!editedTodo.value) {
        return;
      }
      editedTodo.value = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      }
    }

    function cancelEdit(todo) {
      editedTodo.value = null;
      todo.title = beforeEditCache;
    }

    function removeCompleted() {
      todos.value = filters.active(todos.value);
    }

    return {
      todos,
      newTodo,
      editedTodo,
      visibility,

      // methods
      pluralize,
      addTodo,
      removeTodo,
      editTodo,
      doneEdit,
      cancelEdit,
      removeCompleted,

      // computed
      filteredTodos,
      remaining,
      allDone
    };
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
