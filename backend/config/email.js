import nodemailer from 'nodemailer';

export const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }
  const secure = port === 465; // true for 465, false for other ports
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
};

export const sendInvitationEmail = async ({ to, companyName, inviterName, link }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `WorkPro <${process.env.SMTP_USER}>`;
  const subject = `Invitation to join ${companyName} on WorkPro`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;">
      <h2>You're invited to join ${companyName}</h2>
      <p>${inviterName} has invited you to join ${companyName} on WorkPro.</p>
      <p>Please click the link below to accept your invitation:</p>
      <p><a href="${link}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Accept Invitation</a></p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><code>${link}</code></p>
      <p>This link expires in 7 days.</p>
    </div>
  `;
  await transporter.sendMail({ from, to, subject, html });
};
