const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
 status: {
  type: String,
  enum: ['pending', 'completed', 'deleted', 'overdue'],
  default: 'pending'
},
dueDate: {
  type: Date,
  required: [true, 'Due date is required']
},
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);