const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;
  
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  console.log('[EMAIL] Ethereal test account created:', testAccount.user);
  return transporter;
};

const sendOverdueEmail = async (toEmail, taskTitle) => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"Todo App" <todoapp@test.com>',
      to: toEmail,
      subject: '⚠️ Task Overdue',
      html: `<h2>Task "${taskTitle}" is now overdue!</h2>`
    });
    console.log(`[EMAIL] Overdue email sent. Preview: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.error('[EMAIL] Failed:', err.message);
  }
};

const sendCompletedEmail = async (toEmail, taskTitle) => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"Todo App" <todoapp@test.com>',
      to: toEmail,
      subject: '✅ Task Completed',
      html: `<h2>You completed "${taskTitle}"!</h2>`
    });
    console.log(`[EMAIL] Completion email sent. Preview: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.error('[EMAIL] Failed:', err.message);
  }
};

module.exports = { sendOverdueEmail, sendCompletedEmail };