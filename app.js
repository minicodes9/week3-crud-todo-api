require('dotenv').config();
const Todo = require('./models/todo');
const express = require('express');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("Could not connect:", err));

const { todoSchema } = require('./middlewares/validator');
const logger = require('./middlewares/logger');

app.use(cors());
app.use(express.json());
app.use(logger);


// --- ROUTES ---
app.get('/', (req, res) => {
  res.send('Week 7 MongoDB Todo API is live!');
});

app.get('/todos', async (req, res) => {
  try {
    const { completed } = req.query;
    let query = {};

    if (completed !== undefined) {
      query.completed = completed === 'true'; 
    }

    const todos = await Todo.find(query);
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from database" });
  }
});

app.post('/todos', async (req, res, next) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newTodo = new Todo({
      task: req.body.task,
      completed: req.body.completed || false
    });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    next(err);
  }
});

app.patch('/todos/:id', async (req, res, next) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id, 
      { 
        task: req.body.task, 
        completed: req.body.completed 
      }, 
      { new: true } 
    );

    if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });

    res.json(updatedTodo);
  } catch (err) {
    next(err);
  }
});

app.delete('/todos/:id', async (req, res, next) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!deletedTodo) return res.status(404).json({ error: 'Not found' });
    
    res.status(204).send();
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

