
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: `${process.env.EMAIL_SENDER}`,
      pass: `${process.env.EMAIL_PASSWORD}`,
    },
  });

  let message = {
    from: options.from, // sender address
    to: options.to, // list of receivers
    subject: options.subject, // Subject line
    text: options.text, // plain text body
  };

  try {
    await transporter.sendMail(message);
    console.log('email has sent ');
  } catch (error) {
    console.log(error);
  }
};
module.exports = sendEmail