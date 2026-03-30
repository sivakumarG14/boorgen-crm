const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * Sends an email with retry logic (max 2 retries).
 */
async function sendEmail({ to, hotel, body, subject }, retries = 2) {
  const mailOptions = {
    from: `BOORGEN Outreach <${process.env.GMAIL_USER}>`,
    to,
    subject: subject || `Quick idea for ${hotel}`,
    text: body,
  };

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to} (attempt ${attempt}): ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`Email attempt ${attempt} failed for ${to}:`, err.message);
      if (attempt === retries + 1) {
        return { success: false, error: err.message };
      }
      // Wait 2s before retry
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

module.exports = { sendEmail };
