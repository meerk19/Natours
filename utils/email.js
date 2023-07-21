const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const emailOpt = {
    from: 'Meer <test@123.com>',
    to: options.email,
    text: options.message,
    subject: options.subject,
  };

  await transporter.sendMail(emailOpt);
};

module.exports = sendEmail;
