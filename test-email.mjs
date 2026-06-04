import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testEmail() {
  console.log('Testing email sending...');
  console.log('User:', process.env.SMTP_USER);
  console.log('Pass:', process.env.SMTP_PASS ? '***' : 'Missing');

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "Test Email",
      text: "This is a test email.",
    });
    console.log("Success! Message ID:", info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

testEmail();
