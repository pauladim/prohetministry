const router = require('express').Router()
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const Contact = require('../models/Contact')
const { validateContact } = require('../utils/validation')
const { sendContactAcknowledgement } = require('../utils/email')

// Rate limiter for contact submissions (max 5 per hour per IP)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many messages sent from this IP. Please try again after an hour.' }
})

router.post('/', contactLimiter, validateContact, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    // Save to DB if connection is active
    if (mongoose.connection.readyState === 1) {
      try {
        await Contact.create({ name, email, subject, message, status: 'unread' })
      } catch (dbErr) {
        console.error('❌ Failed to save contact message to DB:', dbErr.stack || dbErr.message)
        return res.status(500).json({ error: 'Database error: Failed to save message' })
      }
    } else {
      console.log('ℹ️  Skipped database save for contact message (no active DB connection)')
    }

    // Send acknowledgement email
    try {
      await sendContactAcknowledgement({ to: email, name, subject })
    } catch (emailErr) {
      console.warn('⚠️  Contact confirmation email failed to send:', emailErr.message)
    }

    res.json({ success: true, message: 'Message received. We will be in touch soon.' })
  } catch (err) {
    console.error('Contact route error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

module.exports = router
