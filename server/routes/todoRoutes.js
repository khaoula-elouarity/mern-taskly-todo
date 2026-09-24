const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteCompleted,
} = require('../controllers/todoController');

// All todo routes require a valid JWT
router.use(protect);

router.route('/').get(getTodos).post(createTodo);
router.route('/completed').delete(deleteCompleted);
router.route('/:id').get(getTodoById).put(updateTodo).delete(deleteTodo);

module.exports = router;