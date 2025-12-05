// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (toEmail, licenceNo) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!toEmail || !emailRegex.test(toEmail)) {
    throw new Error('Invalid email address');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dhruvpopat268@gmail.com',
        pass: 'luzx npeg ewbq rknk' // NOT your Gmail password
      }
    });

    const formLink = `https://docs.google.com/forms/d/e/1FAIpQLSeIgBSmSmdKhFmyOSOqHUopHUONM2qeg6zcLSAKtIbO7l091g/viewform?usp=header`;

    const mailOptions = {
      from: 'dhruvpopat268@gmail.com',
      to: toEmail,
      subject: 'Consent Form Required',
      html: `
        <p>Dear Driver,</p>
        <p>We could not give permission for license check of your license number</p>
        <p>Please fill out the consent form here: <a href="${formLink}">${formLink}</a></p>
        <p>Thanks,<br/>Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending failed', error);
  }
};

module.exports = sendEmail;