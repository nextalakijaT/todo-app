const Todo = require('../models/Todo');

const getTodos = async (req, res, next) => {
  try {
    const { filter } = req.query;

    // Always fetch only THIS user's todos, never show deleted ones by default
    const query = {
      userId: req.session.userId,
      status: { $ne: 'deleted' }
    };

    // If a filter is applied, narrow down by status
    if (filter === 'pending' || filter === 'completed') {
      query.status = filter;
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 });

    console.log(`[TODO] Fetched ${todos.length} todos for user ${req.session.userId}`);
    res.render('todos/index', { todos, filter: filter || 'all' });
  } catch (err) {
    next(err);
  }
};

const createTodo = async (req, res, next) => {
  try {
    const { title } = req.body;

    await Todo.create({ title, userId: req.session.userId });

    console.log(`[TODO] Created new task: "${title}" for user ${req.session.userId}`);
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

    // Reject any status value that isn't one of the three allowed ones
    if (!validStatuses.includes(status)) {
      const err = new Error('Invalid status value');
      err.statusCode = 400;
      return next(err);
    }

    // The userId check ensures a user can ONLY update their OWN todos
    await Todo.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      { status }
    );

    console.log(`[TODO] Task ${id} updated to: ${status}`);
    res.redirect('/todos');
  } catch (err) {
    next(err);
  }
};

module.exports = { getTodos, createTodo, updateStatus };