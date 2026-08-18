const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const rateLimit = require('express-rate-limit')
const Order = require('../models/Order')
const Book = require('../models/Book')
const mongoose = require('mongoose')
const { validateDelivery } = require('../utils/validation')

// Rate limiter for ebook downloads
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many download requests from this IP, please try again later' }
})

// ─── Save Delivery Details ────────────────────────────────────────────────────
router.post('/delivery', validateDelivery, async (req, res) => {
  try {
    const { orderId, fullName, phone, address, city, country } = req.body

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        delivery: { fullName, phone, address, city, country, deliveryStatus: 'pending' }
      },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ success: true, order })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save delivery details' })
  }
})

// ─── E-Book Download Redirect (Backward Compatibility) ──────────────────────
router.get('/download/:token', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://prohetministry-l1ww-rose.vercel.app'
  res.redirect(`${frontendUrl}/download/${req.params.token}`)
})

// ─── E-Book Read Online Redirect (Backward Compatibility) ───────────────────
router.get('/read/:token', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://prohetministry-l1ww-rose.vercel.app'
  res.redirect(`${frontendUrl}/download/${req.params.token}?inline=true`)
})

module.exports = router
