const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // CORS ヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'お名前・メールアドレス・相談内容は必須です。' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"UrayahaDays お問い合わせ" <${process.env.GMAIL_ADDRESS}>`,
      to: 'dragonrondo@gmail.com',
      subject: `【B2Bポートフォリオ】${name} 様よりお問い合わせ`,
      encoding: 'utf-8',
      text: [
        `お名前: ${name}`,
        `メールアドレス: ${email}`,
        '',
        '【ご相談内容】',
        message,
      ].join('\n'),
      html: `
        <h2>B2Bポートフォリオ お問い合わせ</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;width:120px"><strong>お名前</strong></td>
              <td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9"><strong>メールアドレス</strong></td>
              <td style="padding:8px;border:1px solid #ddd"><a href="mailto:${email}">${email}</a></td></tr>
        </table>
        <h3>ご相談内容</h3>
        <p style="white-space:pre-wrap;background:#f4f4f4;padding:16px;border-radius:4px">${message}</p>
      `,
      replyTo: email,
    });

    return res.status(200).json({ success: true, message: '送信完了しました。' });
  } catch (err) {
    console.error('メール送信エラー:', err);
    return res.status(500).json({ error: 'メール送信に失敗しました。直接メールにてご連絡ください。' });
  }
};
