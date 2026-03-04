import nodemailer from 'nodemailer';

export const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error('[SMTP ERROR] Missing config:', {
      host: host ? 'set' : 'missing',
      user: user ? 'set' : 'missing',
      pass: pass ? 'set' : 'missing'
    });
    throw new Error('SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }

  const secure = port === 465;
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

export const sendVerificationEmail = async ({ to, verifyLink, firstName }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `WorkPro <${process.env.SMTP_USER}>`;
  const subject = 'Verify Your Email — WorkPro';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#7c3aed;">Verify Your Email Address</h2>
      <p>Hi ${firstName || 'there'},</p>
      <p>Thanks for signing up for WorkPro! Please verify your email address to activate your account.</p>
      <p style="margin:30px 0;">
        <a href="${verifyLink}" 
           style="background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="background:#f3f4f6;padding:12px;border-radius:6px;word-break:break-all;">
        <code>${verifyLink}</code>
      </p>
      <p><strong>This link will expire in 24 hours.</strong></p>
      <p style="color:#6b7280;font-size:14px;margin-top:30px;">
        If you didn't create a WorkPro account, please ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
      <p style="color:#9ca3af;font-size:12px;">
        WorkPro - Collaborative Work Management Platform
      </p>
    </div>
  `;
  await transporter.sendMail({ from, to, subject, html });
};

export const sendWelcomeEmail = async ({ to, firstName }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `WorkPro <${process.env.SMTP_USER}>`;
  const subject = 'Welcome to WorkPro! 🎉';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#7c3aed;">Welcome to WorkPro! 🎉</h2>
      <p>Hi ${firstName || 'there'},</p>
      <p>Your email has been verified and your account is now active. We're excited to have you on board!</p>
      <p>Here are a few things to get you started:</p>
      <ul style="line-height:1.8;">
        <li>🏢 Set up your profile and invite your team</li>
        <li>📋 Create your first project group</li>
        <li>💬 Explore task management and channels</li>
        <li>📊 Check out Analytics for daily insights</li>
      </ul>
      <p style="margin:30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth" 
           style="background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">
          Get Started
        </a>
      </p>
      <p>If you have any questions, feel free to reply to this email or reach out to our support team.</p>
      <p>Best regards,<br>The WorkPro Team</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
      <p style="color:#9ca3af;font-size:12px;">
        WorkPro - Collaborative Work Management Platform
      </p>
    </div>
  `;
  await transporter.sendMail({ from, to, subject, html });
};
