const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOverdueEmail = async (toEmail, taskTitle) => {
  try {
    await transporter.sendMail({
      from: `"Todo App" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '⚠️ Task Overdue',
      html: `
        <h2>Task Overdue</h2>
        <p>Your task <strong>"${taskTitle}"</strong> is now overdue.</p>
        <p>Log in to your todo app to update it.</p>
      `
    });
    console.log(`[EMAIL] Overdue email sent for task: ${taskTitle}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send email:', err.message);
  }
};

const sendCompletedEmail = async (toEmail, taskTitle) => {
  try {
    await transporter.sendMail({
      from: `"Todo App" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '✅ Task Completed',
      html: `
        <h2>Task Completed</h2>
        <p>You completed the task <strong>"${taskTitle}"</strong>. Great work!</p>
      `
    });
    console.log(`[EMAIL] Completion email sent for task: ${taskTitle}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send email:', err.message);
  }
};

module.exports = { sendOverdueEmail, sendCompletedEmail };