const Todo = require('../models/Todo');
const User = require('../models/User');
const { sendCompletedEmail } = require('../utils/mailer');

const getTodos = async (req, res, next) => {
  try {
    const { filter } = req.query;

    const query = {
      userId: req.session.userId,
      status: { $ne: 'deleted' }
    };

    if (filter === 'pending') query.status = 'pending';
    if (filter === 'completed') query.status = 'completed';
    if (filter === 'overdue') query.status = 'overdue';
    res.render('todos/index', { 
  todos, 
  filter: filter || 'all',
  token: req.session.token || ''
});

    const todos = await Todo.find(query).sort({ dueDate: 1 });
    res.render('todos/index', { todos, filter: filter || 'all', token: req.session.token || '' });
  } catch (err) {
    next(err);
  }
};

const createTodo = async (req, res, next) => {
  try {
    const { title, dueDate } = req.body;

    if (!dueDate) {
      return res.redirect('/todos');
    }

    await Todo.create({ 
      title, 
      dueDate: new Date(dueDate),
      userId: req.session.userId 
    });

    console.log(`[TODO] Created task: "${title}" due: ${dueDate}`);
    res.redirect('/todos');
  } catch (err) {
    next(err);
  }
};
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'completed', 'deleted'];

    if (!validStatuses.includes(status)) {
      const err = new Error('Invalid status value');
      err.statusCode = 400;
      return next(err);
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      { status },
      { new: true }
    );

    // If task was just completed, send notifications
    if (status === 'completed' && todo) {
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      const user = await User.findById(req.session.userId);

      // Real-time notification if user is online
      const socketId = connectedUsers[req.session.userId.toString()];
      if (socketId) {
        io.to(socketId).emit('task:completed', { 
          title: todo.title,
          id: todo._id 
        });
      }

      // Email notification
      if (user && user.email) {
        await sendCompletedEmail(user.email, todo.title);
      }

      console.log(`[TODO] Task completed and notifications sent: ${todo.title}`);
    }

    res.redirect('/todos');
  } catch (err) {
    next(err);
  }
};
module.exports = { getTodos, createTodo, updateStatus };