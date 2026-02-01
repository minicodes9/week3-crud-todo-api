const express = require('express');
const cors = require('cors');
const app = express();

const { todoSchema } = require('./middlewares/validator');
const logger = require('./middlewares/logger');

app.use(cors());
app.use(express.json());
app.use(logger);

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// --- ROUTES ---
app.get('/', (req, res) => {
  res.send('Week 3 Todo API is live! Visit /todos to see your todos.');
});

app.get('/todos', (req, res) => {
  res.status(200).json(todos);
});

app.post('/todos', (req, res, next) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newTodo = {
      id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1, // Better ID generation
      task: req.body.task,
      completed: req.body.completed || false // Use provided value or default to false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
});

app.patch('/todos/:id', (req, res, next) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    // FIX: Update both task and completed if they are in the request
    if (req.body.task !== undefined) todo.task = req.body.task;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;

    res.json(todo);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));