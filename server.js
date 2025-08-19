import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public', { maxAge: '1h', etag: true }));
app.use('/images', express.static('images', { maxAge: '1d' }));
app.use(express.json());

// Contact endpoint (configure SMTP via .env)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
      replyTo: email,
      to: process.env.MAIL_TO,
      subject: `Website contact: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Email failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
