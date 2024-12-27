import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const options = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(options);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
