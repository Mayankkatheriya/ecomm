const nodemailer = require("nodemailer");

const sendEmailHandler = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 587,
      secure: true,
      auth: {
        user: "mayankkatheriya4@gmail.com",
        pass: process.env.EMAIL_KEY,
      },
    });

    await transporter.sendMail({
      from: "mayankkatheriya4@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
    console.log("EMail send successfully");
  } catch (err) {
    console.log(err.message);
    return err;
  }
};

module.exports = { sendEmailHandler };
