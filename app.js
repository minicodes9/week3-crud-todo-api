const express = require('express');
const app = express();

const { todoSchema } = require('./middlewares/validator');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());
app.use(logger);
app.use(errorHandler);

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// Root route – optional, shows API is live
app.get('/', (req, res) => {
  res.send('Week 3 Todo API is live! Visit /todos to see your todos.');
});

// GET All – Read
app.get('/todos', (req, res) => {
  res.status(200).json(todos); // Send array as JSON
});



// POST New – Create
app.post('/todos', (req, res, next) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newTodo = {
      id: todos.length + 1,
      task: req.body.task,
      completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (err) {
    next(err); // Pass to global error handler
  }
});


// PATCH Update 
app.patch('/todos/:id', (req, res, next) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    todo.task = req.body.task;
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE Remove
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
  if (todos.length === initialLength)
    return res.status(404).json({ error: 'Not found' });
  res.status(204).send(); // Silent success
});

app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((t) => t.completed);
  res.json(completed); // Custom Read!
});
// GET Active – not completed
app.get('/todos/active', (req, res) => {
  const activeTodos = todos.filter((t) => !t.completed);
  res.json(activeTodos);
});

// GET One – Read by ID
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  res.json(todo);
});


app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Server error!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

