import {createApp, ref, computed, onMounted, watch} from './node_modules/vue/dist/vue.esm-browser.js';

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
  setup() {
    // 顯示方法
    const todos = ref([]);
    const visibility = ref('all')
    const filteredTodos = computed(() => filters[visibility.value](todos.value));
    const remaining = computed(() => filters.active(todos.value).length)
    const pluralize = (n) => n === 1 ? 'item' : 'items';

    // 新增、刪除
    const newTodo = ref('');
    const addTodo = () => {
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

    const removeTodo = (todo) => {
      todos.value.splice(todos.value.indexOf(todo), 1);
    }

    // 獨立邏輯（編輯及取消
    const editedTodo = ref(null);
    let beforeEditCache = null;
    const editTodo = (todo) => {
      beforeEditCache = todo.title;
      editedTodo.value = todo;
    }

    const doneEdit = (todo) => {
      if (!editedTodo.value) {
        return;
      }
      editedTodo.value = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        removeTodo(todo);
      }
    }

    const cancelEdit = (todo) => {
      editedTodo.value = null;
      todo.title = beforeEditCache;
    }

    //  狀態調整
    const removeCompleted = () => {
      todos.value = filters.active(todos.value)
    }

    const allDone = computed({
      get: () => remaining === 0,
      set: (value) => todos.value.forEach(todo => todo.completed = value)
    });

    // LocalStorage 操作
    onMounted(() => todos.value = todoStorage.fetch());
    watch(
      todos,
      () => {
        todoStorage.save(todos.value);
      }, {
      deep: true
    });

    return {
      // data
      todos,
      newTodo,
      editedTodo,
      visibility,

      // computed
      filteredTodos,
      remaining,
      allDone,

      // methods
      pluralize,
      addTodo,
      removeTodo,
      editTodo,
      doneEdit,
      cancelEdit,
      removeCompleted
    }
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
