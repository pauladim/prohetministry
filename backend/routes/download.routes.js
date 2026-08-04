const router = require('express').Router()
const rateLimit = require('express-rate-limit')
const downloadController = require('../controllers/download.controller')

// Rate limiter for ebook downloads (max 10 downloads per hour per IP)
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { error: 'Too many download attempts from this IP. Please try again in an hour.' }
})

// Route for secure download token verification and streaming
router.get('/:token', downloadLimiter, downloadController.downloadBook)

module.exports = router
