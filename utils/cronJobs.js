const cron = require('node-cron');
const Todo = require('../models/Todo');
const User = require('../models/User');
const { sendOverdueEmail } = require('./mailer');

const startCronJobs = (io, connectedUsers) => {

  // Run every minute — check for overdue tasks
  cron.schedule('* * * * *', async () => {
    console.log('[CRON] Checking for overdue tasks...');

    try {
      // Find all pending tasks where dueDate has passed
      const overdueTodos = await Todo.find({
        status: 'pending',
        dueDate: { $lt: new Date() }
      });

      for (const todo of overdueTodos) {
        // Update status to overdue
        todo.status = 'overdue';
        await todo.save();

        console.log(`[CRON] Task marked overdue: ${todo.title}`);

        // Get the user who owns this task
        const user = await User.findById(todo.userId);
        if (!user) continue;

        // Send real-time notification if user is connected
        const socketId = connectedUsers[todo.userId.toString()];
        if (socketId) {
          io.to(socketId).emit('task:overdue', { 
            title: todo.title,
            id: todo._id 
          });
          console.log(`[SOCKET] Overdue notification sent to user: ${user.username}`);
        } else {
          console.log(`[SOCKET] User ${user.username} is offline - skipping real-time notification`);
        }

        // Send email regardless of whether user is online
        if (user.email) {
          await sendOverdueEmail(user.email, todo.title);
        }
      }
    } catch (err) {
      console.error('[CRON] Error checking overdue tasks:', err.message);
    }
  });

};

module.exports = startCronJobs;