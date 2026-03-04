import nodemailer from 'nodemailer';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Get potential recipients for the selector
export const getEmailRecipients = async (req, res) => {
    try {
        const users = await User.find({})
            .select('firstName lastName email companies isSuperAdmin created_at')
            .populate({
                path: 'companies',
                select: 'name plan',
                populate: {
                    path: 'plan',
                    select: 'name'
                }
            });

        // We can format this to make it easier for frontend
        const recipients = users.map(user => {
            // Get unique plan names for the user
            const plans = [...new Set(user.companies.map(c => c.plan?.name).filter(Boolean))];

            return {
                _id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.isSuperAdmin ? 'Super Admin' : (user.companies.length > 0 ? 'User' : 'New User'), // Simplified role logic for now
                companyCount: user.companies.length,
                plans: plans // Array of plan names this user belongs to
            };
        });

        res.json(recipients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send email to selected users
export const sendEmailToUsers = async (req, res) => {
    const { userIds, subject, message, isHtml } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'No recipients selected.' });
    }

    if (!subject || !message) {
        return res.status(400).json({ message: 'Subject and message are required.' });
    }

    try {
        // Fetch users to get emails
        const users = await User.find({ _id: { $in: userIds } }).select('email');
        const emails = users.map(u => u.email).filter(Boolean); // Filter out any missing emails

        if (emails.length === 0) {
            return res.status(400).json({ message: 'No valid email addresses found for selected users.' });
        }

        // Send mails
        // Note: For bulk emails, it's better to send individually or use BCC to protect privacy.
        // We will send individually here to ensure delivery and avoid exposing list.
        // For very large lists, a queue system (Bull/Redis) is better, but simple loop works for < 100.

        const sendPromises = emails.map(email => {
            return transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: email,
                subject: subject,
                text: isHtml ? undefined : message,
                html: isHtml ? message : undefined,
            }).catch(err => {
                console.error(`Failed to send to ${email}:`, err.message);
                return { error: err.message, email };
            });
        });

        const results = await Promise.allSettled(sendPromises);

        const successCount = results.filter(r => r.status === 'fulfilled' && !r.value?.error).length;
        const failCount = results.length - successCount;

        res.json({
            message: `Emails processed. Sent: ${successCount}, Failed: ${failCount}`,
            details: { successCount, failCount }
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ message: 'Failed to send emails.' });
    }
};
