import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testSMTP() {
  console.log('\n=== TESTING SMTP CONFIGURATION ===');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***set***' : 'MISSING');
  console.log('SMTP_FROM:', process.env.SMTP_FROM);
  console.log('=====================================\n');

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials are missing in .env file!');
    process.exit(1);
  }

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Try sending a test email
    console.log('Sending test email...');
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'WorkPro SMTP Test',
      text: 'If you receive this, SMTP is working correctly!',
      html: '<p>If you receive this, <strong>SMTP is working correctly!</strong></p>',
    });
    console.log('✅ Test email sent successfully!\n');
    console.log('Check your inbox:', process.env.SMTP_USER);
  } catch (err) {
    console.error('❌ SMTP test failed:', err.message);
    console.error('\nFull error:', err);
    process.exit(1);
  }
}

testSMTP();
