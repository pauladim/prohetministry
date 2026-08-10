console.log('🔥🔥🔥 EMAIL.JS HAS BEEN LOADED 🔥🔥🔥')

const nodemailer = require('nodemailer')

console.log('📧 EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET')
console.log('📧 EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET')
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET')
console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET')
console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM ? 'SET' : 'NOT SET')
const nodemailer = require('nodemailer')

console.log('📧 email.js loaded')
console.log('📧 EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET')
console.log('📧 EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET')
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET')
console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET')
console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM ? 'SET' : 'NOT SET')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Verify connection on startup
transporter.verify()
  .then(() => console.log('✅ Email transporter ready'))
  .catch(err => console.warn('⚠️  Email transporter not configured:', err.message))

/**
 * Send ebook download link email
 */
async function sendEbookDownloadEmail({ to, name, bookTitle, downloadUrl, readOnlineUrl, reference }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f4fbf7; font-family: 'Georgia', serif; }
        .wrapper { max-width: 560px; margin: 20px auto; padding: 40px 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid rgba(22, 163, 74, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .header { text-align: center; border-bottom: 1px solid rgba(22, 163, 74, 0.15); padding-bottom: 30px; margin-bottom: 30px; }
        .logo { font-size: 11px; letter-spacing: 0.4em; color: #15803d; text-transform: uppercase; margin-bottom: 8px; }
        .name { font-size: 24px; color: #111827; }
        h1 { color: #111827; font-size: 28px; font-weight: normal; margin-bottom: 8px; }
        p { color: #374151; line-height: 1.7; font-size: 15px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #16a34a, #22c55e); color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2); text-align: center; }
        .btn-secondary { background: linear-gradient(135deg, #0f172a, #1e293b); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); }
        .ref { background: #f0fdf4; border: 1px solid rgba(22, 163, 74, 0.15); border-radius: 8px; padding: 16px; margin: 20px 0; }
        .ref-label { font-size: 10px; color: #16a34a; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 4px; }
        .ref-value { font-family: monospace; color: #374151; font-size: 13px; }
        .footer { border-top: 1px solid rgba(22, 163, 74, 0.1); padding-top: 24px; margin-top: 32px; text-align: center; }
        .footer p { font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">Prophet</div>
          <div class="name">Desmond Obi Ministry</div>
        </div>

        <h1>Your Book Is Ready</h1>
        <p>Dear ${name},</p>
        <p>Thank you for purchasing <strong style="color: #16a34a;">${bookTitle}</strong>. Your payment has been confirmed. You can now access your e-book using the buttons below.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" class="btn" style="margin: 8px 12px;">Download PDF</a>
        </div>

        <p style="font-size: 13px; color: #6b7280;">
          These links are unique to your purchase. Please do not share them. They will remain active for 24 hours.
        </p>

        <div class="ref">
          <div class="ref-label">Payment Reference</div>
          <div class="ref-value">${reference}</div>
        </div>

        <p>May God's word in this book transform every area of your life. We believe you will encounter the living God through these pages.</p>

        <div class="footer">
          <p>Desmond Obi Prophetic Ministries · Lagos, Nigeria</p>
          <p>ministry@Desmondobi.org</p>
          <p style="margin-top: 12px; font-size: 11px;">© ${new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Prophet Desmond Obi Ministry" <noreply@ministry.org>',
    to,
    subject: `📖 Your E-Book: ${bookTitle} — Download Ready`,
    html,
  })
}

/**
 * Send order confirmation for physical book
 */
async function sendPhysicalOrderConfirmationEmail({ to, name, bookTitle, reference }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f4fbf7; font-family: 'Georgia', serif; }
        .wrapper { max-width: 560px; margin: 20px auto; padding: 40px 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid rgba(22, 163, 74, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .header { text-align: center; border-bottom: 1px solid rgba(22, 163, 74, 0.15); padding-bottom: 30px; margin-bottom: 30px; }
        .logo { font-size: 11px; letter-spacing: 0.4em; color: #15803d; text-transform: uppercase; }
        .name { font-size: 24px; color: #111827; }
        h1 { color: #111827; font-size: 28px; font-weight: normal; }
        p { color: #374151; line-height: 1.7; font-size: 15px; }
        .footer { border-top: 1px solid rgba(22, 163, 74, 0.1); padding-top: 24px; margin-top: 32px; text-align: center; }
        .footer p { font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">Prophet</div>
          <div class="name">Desmond Obi Ministry</div>
        </div>
        <h1>Order Confirmed! 📦</h1>
        <p>Dear ${name},</p>
        <p>Your order for <strong style="color: #16a34a;">${bookTitle}</strong> has been confirmed. We will process and ship your book within 3–5 business days.</p>
        <p>Reference: <code style="color: #15803d;">${reference}</code></p>
        <div class="footer">
          <p>Desmond Obi Prophetic Ministries · ministry@desmondobi.org</p>
        </div>
      </div>
    </body>
    </html>
  `

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Order Confirmed: ${bookTitle}`,
    html,
  })
}

/**
 * Send contact acknowledgement
 */
async function sendContactAcknowledgement({ to, name, subject }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'We received your message — Prophet Desmond Obi Ministry',
    html: `<p>Dear ${name},<br/><br/>Thank you for reaching out. We have received your message and will respond within 2–3 business days.<br/><br/>God bless you,<br/>Desmond Obi Ministry Team</p>`,
  })
}

/**
 * Send admin reply to contact message
 */
async function sendContactReplyEmail({ to, name, subject, message, replyMessage }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f4fbf7; font-family: 'Georgia', serif; }
        .wrapper { max-width: 560px; margin: 20px auto; padding: 40px 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid rgba(22, 163, 74, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .header { text-align: center; border-bottom: 1px solid rgba(22, 163, 74, 0.15); padding-bottom: 30px; margin-bottom: 30px; }
        .logo { font-size: 11px; letter-spacing: 0.4em; color: #15803d; text-transform: uppercase; margin-bottom: 8px; }
        .name { font-size: 24px; color: #111827; }
        h1 { color: #111827; font-size: 22px; font-weight: normal; margin-bottom: 20px; }
        p { color: #374151; line-height: 1.7; font-size: 15px; }
        .reply-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .original-quote { border-left: 3px solid #d1d5db; padding-left: 12px; color: #6b7280; font-style: italic; margin-top: 20px; }
        .footer { border-top: 1px solid rgba(22, 163, 74, 0.1); padding-top: 24px; margin-top: 32px; text-align: center; }
        .footer p { font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">Prophet</div>
          <div class="name">Desmond Obi Ministry</div>
        </div>

        <h1>Response to Your Inquiry: ${subject}</h1>
        <p>Dear ${name},</p>
        <p>Prophet Desmond Obi Ministry has responded to your message:</p>

        <div class="reply-box">
          <p style="margin: 0; white-space: pre-line;"><strong>Message:</strong><br/>${replyMessage}</p>
        </div>

        <div class="original-quote">
          <p style="margin: 0; font-size: 13px;"><strong>Your original inquiry:</strong></p>
          <p style="margin: 4px 0 0 0; font-size: 13px;">"${message}"</p>
        </div>

        <p style="margin-top: 24px;">May God's grace and blessings be with you.</p>

        <div class="footer">
          <p>Desmond Obi Prophetic Ministries · Lagos, Nigeria</p>
          <p>ministry@desmondobi.org</p>
          <p style="margin-top: 12px; font-size: 11px;">© ${new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Prophet Desmond Obi Ministry" <noreply@ministry.org>',
    to,
    subject: `Re: ${subject} — Prophet Desmond Obi Ministry`,
    html,
  })
}

module.exports = { sendEbookDownloadEmail, sendPhysicalOrderConfirmationEmail, sendContactAcknowledgement, sendContactReplyEmail }
