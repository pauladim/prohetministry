require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const path = require('path')

const app = express()

/* ─────────────────────────────────────────────
   STATIC FILES
───────────────────────────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

/* ─────────────────────────────────────────────
   ENV VALIDATION (SAFE VERSION)
───────────────────────────────────────────── */
const requiredEnvVars = [
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'PAYSTACK_SECRET_KEY',
  'MONGODB_URI',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET'
]

const missingEnvVars = requiredEnvVars.filter(
  (v) => !process.env[v] || process.env[v].trim() === ''
)

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing environment variables: ${missingEnvVars.join(', ')}`
  )
  process.exit(1)
}

/* ─────────────────────────────────────────────
   ADMIN HASH VALIDATION (SAFE)
───────────────────────────────────────────── */
const adminHash = process.env.ADMIN_PASSWORD_HASH

if (
  !adminHash.startsWith('$2a$') &&
  !adminHash.startsWith('$2b$') &&
  !adminHash.startsWith('$2y$')
) {
  console.error('❌ ADMIN_PASSWORD_HASH is not a valid bcrypt hash')
  process.exit(1)
}

/* ─────────────────────────────────────────────
   SECURITY MIDDLEWARE
───────────────────────────────────────────── */
app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
)

app.use(morgan('dev'))

/* ─────────────────────────────────────────────
   GLOBAL RATE LIMIT
───────────────────────────────────────────── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

app.use('/api/', limiter)

/* ─────────────────────────────────────────────
   BODY PARSING
───────────────────────────────────────────── */
app.use(express.json({
  verify: (req, res, buf) => {
    if (
      req.originalUrl.startsWith('/api/payments/stripe/webhook') ||
      req.originalUrl.startsWith('/api/payments/paystack/webhook')
    ) {
      req.rawBody = buf
    }
  }
}))
app.use(express.urlencoded({ extended: true }))

/* ─────────────────────────────────────────────
   ROUTES
───────────────────────────────────────────── */
app.use('/api/admin', require('./routes/admin'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/books', require('./routes/books'))
app.use('/api/download', require('./routes/download.routes'))

/* ─────────────────────────────────────────────
   HEALTH CHECK
───────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

/* ─────────────────────────────────────────────
   ERROR HANDLER
───────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message)
  res.status(500).json({
    error: err.message || 'Internal server error'
  })
})

/* ─────────────────────────────────────────────
   DATABASE + SERVER START
───────────────────────────────────────────── */
const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`💳 Paystack key loaded: ${!!process.env.PAYSTACK_SECRET_KEY}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)

    console.log('⚠️ Starting server without database...')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (no DB)`)
    })
  })