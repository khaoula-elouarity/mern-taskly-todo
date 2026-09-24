const Todo = require('../models/Todo');

// @desc    Get all todos for the logged in user
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single todo
// @route   GET /api/todos/:id
// @access  Private
const getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.userId });
    if (!todo) {
      res.status(404);
      throw new Error('Todo not found');
    }
    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private
const createTodo = async (req, res, next) => {
  try {
    const body = req.body || {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      res.status(400);
      throw new Error('Please add a task title');
    }
    if (title.length > 200) {
      res.status(400);
      throw new Error('Title cannot be longer than 200 characters');
    }

    const todo = await Todo.create({
      user: req.userId,
      title,
      important: Boolean(body.important),
    });

    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a todo (title / completed / important)
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res, next) => {
  try {
    const updates = {};

    if (req.body.title !== undefined) {
      updates.title = String(req.body.title).trim();
    }
    if (req.body.completed !== undefined) {
      updates.completed = Boolean(req.body.completed);
    }
    if (req.body.important !== undefined) {
      updates.important = Boolean(req.body.important);
    }

    if (updates.title !== undefined && !updates.title) {
      res.status(400);
      throw new Error('Task title cannot be empty');
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!todo) {
      res.status(404);
      throw new Error('Todo not found');
    }

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.userId });
    if (!todo) {
      res.status(404);
      throw new Error('Todo not found');
    }

    await todo.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Todo removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all completed todos for the logged in user
// @route   DELETE /api/todos/completed
// @access  Private
const deleteCompleted = async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({ user: req.userId, completed: true });
    const deletedCount = result.deletedCount || 0;
    res.status(200).json({
      deletedCount,
      message: deletedCount === 0 ? 'No completed tasks to clear' : 'Completed tasks cleared',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteCompleted,
};