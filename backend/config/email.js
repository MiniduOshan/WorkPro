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

export const sendPasswordResetEmail = async ({ to, resetLink, firstName }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `WorkPro <${process.env.SMTP_USER}>`;
  const subject = 'Reset Your WorkPro Password';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#2563eb;">Password Reset Request</h2>
      <p>Hi ${firstName || 'there'},</p>
      <p>We received a request to reset your password for your WorkPro account.</p>
      <p>Click the button below to reset your password:</p>
      <p style="margin:30px 0;">
        <a href="${resetLink}" 
           style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="background:#f3f4f6;padding:12px;border-radius:6px;word-break:break-all;">
        <code>${resetLink}</code>
      </p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p style="color:#6b7280;font-size:14px;margin-top:30px;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
      <p style="color:#9ca3af;font-size:12px;">
        WorkPro - Collaborative Work Management Platform
      </p>
    </div>
  `;
  await transporter.sendMail({ from, to, subject, html });
};
