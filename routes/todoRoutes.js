const express = require('express');
const router = express.Router();
const { getTodos, createTodo, updateStatus } = require('../controllers/todoController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, getTodos);
router.post('/', isAuthenticated, createTodo);
router.post('/:id', isAuthenticated, updateStatus);

module.exports = router;