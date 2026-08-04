const mongoose = require('mongoose')

function sanitize(str) {
  if (typeof str !== 'string') return str
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return typeof email === 'string' && re.test(email.trim().toLowerCase())
}

const validateContact = (req, res, next) => {
  const { name, email, subject, message } = req.body

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required and must be a string' })
  }
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' })
  }
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return res.status(400).json({ error: 'Subject is required and must be a string' })
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required and must be a string' })
  }

  // Sanitize
  req.body.name = sanitize(name)
  req.body.email = email.trim().toLowerCase()
  req.body.subject = sanitize(subject)
  req.body.message = sanitize(message)

  next()
}

const validateDelivery = (req, res, next) => {
  const { orderId, fullName, phone, address, city, country } = req.body

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: 'A valid Order ID is required' })
  }
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return res.status(400).json({ error: 'Full name is required and must be a string' })
  }
  if (!phone || typeof phone !== 'string' || !phone.trim() || phone.length < 5) {
    return res.status(400).json({ error: 'A valid phone number is required' })
  }
  if (!address || typeof address !== 'string' || !address.trim()) {
    return res.status(400).json({ error: 'Address is required and must be a string' })
  }
  if (!city || typeof city !== 'string' || !city.trim()) {
    return res.status(400).json({ error: 'City is required and must be a string' })
  }
  if (!country || typeof country !== 'string' || !country.trim()) {
    return res.status(400).json({ error: 'Country is required and must be a string' })
  }

  // Sanitize
  req.body.fullName = sanitize(fullName)
  req.body.phone = sanitize(phone)
  req.body.address = sanitize(address)
  req.body.city = sanitize(city)
  req.body.country = sanitize(country)

  next()
}

const validatePaymentInit = (req, res, next) => {
  const { email, name, bookId, successUrl, cancelUrl } = req.body

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' })
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required and must be a string' })
  }
  if (!bookId || typeof bookId !== 'string' || !bookId.trim()) {
    return res.status(400).json({ error: 'Book ID is required and must be a string' })
  }
  if (successUrl && (typeof successUrl !== 'string' || !successUrl.trim() || (!successUrl.startsWith('http://') && !successUrl.startsWith('https://')))) {
    return res.status(400).json({ error: 'Valid success URL is required' })
  }
  if (cancelUrl && (typeof cancelUrl !== 'string' || !cancelUrl.trim() || (!cancelUrl.startsWith('http://') && !cancelUrl.startsWith('https://')))) {
    return res.status(400).json({ error: 'Valid cancel URL is required' })
  }

  // Sanitize inputs
  req.body.name = sanitize(name)
  req.body.email = email.trim().toLowerCase()
  req.body.bookId = sanitize(bookId)
  if (successUrl) req.body.successUrl = successUrl.trim()
  if (cancelUrl) req.body.cancelUrl = cancelUrl.trim()

  next()
}

module.exports = {
  sanitize,
  validateContact,
  validateDelivery,
  validateEmail,
  validatePaymentInit
}
