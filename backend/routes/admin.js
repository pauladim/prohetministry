const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/auth')
const Order = require('../models/Order')
const Contact = require('../models/Contact')
const { sendContactReplyEmail } = require('../utils/email')

// Fail fast at startup if admin environment config is missing
if (!process.env.ADMIN_EMAIL) {
  throw new Error('FATAL: ADMIN_EMAIL environment variable is not set!')
}
if (!process.env.ADMIN_PASSWORD_HASH) {
  throw new Error('FATAL: ADMIN_PASSWORD_HASH environment variable is not set!')
}

// Role-based access control middleware
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin role required' })
  }
  next()
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Direct comparison against required env credentials (no fallback secrets)
    const adminEmail = process.env.ADMIN_EMAIL

    if (email !== adminEmail) {
      console.warn(`[WARN] [AUTH] Failed admin login attempt (email mismatch): InputEmail="${email}", IP=${req.ip}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify hashed password from env using bcrypt
    const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
    if (!isValid) {
      console.warn(`[WARN] [AUTH] Failed admin login attempt (password mismatch): Email="${email}", IP=${req.ip}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    console.log(`[INFO] [AUTH] Successful admin login: Email="${email}", IP=${req.ip}`)
    res.json({ token, admin: { email } })
  } catch (err) {
    console.error('Admin login error:', err.stack || err.message)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ─── Get E-book Orders ────────────────────────────────────────────────────────
router.get('/orders/ebooks', authMiddleware, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ bookType: 'ebook' })
      .sort({ createdAt: -1 })
      .select('name email bookTitle paymentReference paymentGateway paymentStatus orderStatus emailStatus createdAt')
      .lean()

    const formatted = orders.map(o => ({
      _id: o._id,
      name: o.name,
      email: o.email,
      book: o.bookTitle,
      reference: o.paymentReference,
      gateway: o.paymentGateway,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      emailStatus: o.emailStatus,
      createdAt: o.createdAt,
    }))

    res.json(formatted)
  } catch (err) {
    console.error('Fetch ebook orders error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// ─── Get Physical Orders ──────────────────────────────────────────────────────
router.get('/orders/physical', authMiddleware, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ bookType: 'physical' })
      .sort({ createdAt: -1 })
      .lean()

    const formatted = orders.map(o => ({
      _id: o._id,
      name: o.name,
      phone: o.delivery?.phone,
      address: o.delivery?.address,
      city: o.delivery?.city,
      country: o.delivery?.country,
      book: o.bookTitle,
      reference: o.paymentReference,
      gateway: o.paymentGateway,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      deliveryStatus: o.delivery?.deliveryStatus,
      createdAt: o.createdAt,
    }))

    res.json(formatted)
  } catch (err) {
    console.error('Fetch physical orders error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// ─── Update Order Status ─────────────────────────────────────────────────────
router.put('/orders/:id/status', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { orderStatus, deliveryStatus } = req.body
    const updateData = {}

    if (orderStatus) {
      if (!['pending', 'paid', 'processing', 'completed', 'cancelled'].includes(orderStatus)) {
        return res.status(400).json({ error: 'Invalid orderStatus value' })
      }
      updateData.orderStatus = orderStatus
    }

    if (deliveryStatus) {
      if (!['pending', 'processing', 'shipped', 'delivered'].includes(deliveryStatus)) {
        return res.status(400).json({ error: 'Invalid deliveryStatus value' })
      }
      updateData['delivery.deliveryStatus'] = deliveryStatus
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true })
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ success: true, order })
  } catch (err) {
    console.error('Update order status error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// ─── Get Contact Messages ─────────────────────────────────────────────────────
router.get('/contacts', authMiddleware, isAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).lean()
    res.json(messages)
  } catch (err) {
    console.error('Fetch contact messages error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

// ─── Update Contact Status (Read / Archived) ──────────────────────────────────
router.put('/contacts/:id/status', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status } = req.body
    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid contact status value' })
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    )

    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' })
    }

    res.json({ success: true, contact })
  } catch (err) {
    console.error('Update contact status error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to update contact status' })
  }
})

// ─── Reply to Contact Message ─────────────────────────────────────────────────
router.post('/contacts/:id/reply', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { replyMessage } = req.body
    if (!replyMessage || typeof replyMessage !== 'string' || !replyMessage.trim()) {
      return res.status(400).json({ error: 'A valid reply message is required' })
    }

    const contact = await Contact.findById(req.params.id)
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' })
    }

    contact.replyMessage = replyMessage.trim()
    contact.repliedAt = new Date()
    contact.status = 'replied'

    await contact.save()

    // Send actual reply email
    // try {
    //   await sendContactReplyEmail({
    //     to: contact.email,
    //     name: contact.name,
    //     subject: contact.subject,
    //     message: contact.message,
    //     replyMessage: contact.replyMessage
    //   })
    // } catch (emailErr) {
    //   console.warn('⚠️ Reply email failed to send:', emailErr.message)
    // }

    // res.json({ success: true, contact })

    res.json({ success: true, contact })

sendContactReplyEmail({
  to: contact.email,
  name: contact.name,
  subject: contact.subject,
  message: contact.message,
  replyMessage: contact.replyMessage
})
  .then(() => {
    console.log('✅ Reply email sent successfully')
  })
  .catch((emailErr) => {
    console.error('❌ Reply email failed:', emailErr.message)
  })
  } catch (err) {
    console.error('Reply contact message error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to save reply message' })
  }
})

// ─── Manage Books (Admin Only) ──────────────────────────────────────────────────
const multer = require('multer')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')
const Book = require('../models/Book')

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
])

const uploadToGridFS = (file, bucketName = 'ebooks') => {
  return new Promise((resolve, reject) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName
    })
    
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype
    })
    
    Readable.from(file.buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id)
      })
  })
}

const deleteFromGridFS = async (fileId, bucketName = 'ebooks') => {
  if (!fileId) return
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName
    })
    await bucket.delete(new mongoose.Types.ObjectId(fileId))
  } catch (err) {
    console.error('Error deleting file from GridFS:', err.message)
  }
}

const saveCoverImage = async (file) => {
  const uploadsDir = path.join(__dirname, '../uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  const filename = `cover-${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
  const filepath = path.join(uploadsDir, filename)
  await fs.promises.writeFile(filepath, file.buffer)
  return `/uploads/${filename}`
}

const deleteCoverImage = (coverPath) => {
  if (!coverPath) return
  const filepath = path.join(__dirname, '../', coverPath)
  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('Failed to delete cover image:', err.message)
    }
  })
}

// 1. Create a Book
router.post('/books', authMiddleware, isAdmin, upload, async (req, res) => {
  try {
    const { title, author, category, price, description, type, tag } = req.body

    if (!title || !author || !category || !price || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
      return res.status(400).json({ error: 'Both cover image and PDF file are required' })
    }

    const coverImageFile = req.files.coverImage[0]
    const pdfFile = req.files.pdfFile[0]

    const coverImageUrl = await saveCoverImage(coverImageFile)
    const pdfFileId = await uploadToGridFS(pdfFile)

    const book = await Book.create({
      title,
      author,
      category,
      price: parseFloat(price),
      description,
      coverImage: coverImageUrl,
      pdfFileId,
      type: type || 'ebook',
      tag: tag || null
    })

    res.status(201).json({ success: true, book })
  } catch (err) {
    console.error('Admin create book error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to create book' })
  }
})

// 2. Edit a Book
router.put('/books/:id', authMiddleware, isAdmin, upload, async (req, res) => {
  try {
    const { title, author, category, price, description, type, tag } = req.body
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({ error: 'Book not found' })
    }

    if (title) book.title = title
    if (author) book.author = author
    if (category) book.category = category
    if (price) book.price = parseFloat(price)
    if (description) book.description = description
    if (type) book.type = type
    if (tag !== undefined) book.tag = tag || null

    if (req.files && req.files.coverImage) {
      if (book.coverImage && book.coverImage.startsWith('/uploads')) {
        deleteCoverImage(book.coverImage)
      }
      book.coverImage = await saveCoverImage(req.files.coverImage[0])
    }

    if (req.files && req.files.pdfFile) {
      if (book.pdfFileId) {
        await deleteFromGridFS(book.pdfFileId)
      }
      book.pdfFileId = await uploadToGridFS(req.files.pdfFile[0])
    }

    await book.save()
    res.json({ success: true, book })
  } catch (err) {
    console.error('Admin edit book error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to update book' })
  }
})

// 3. Delete a Book
router.delete('/books/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) {
      return res.status(404).json({ error: 'Book not found' })
    }

    if (book.coverImage && book.coverImage.startsWith('/uploads')) {
      deleteCoverImage(book.coverImage)
    }
    if (book.pdfFileId) {
      await deleteFromGridFS(book.pdfFileId)
    }

    await Book.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Book and associated files deleted successfully' })
  } catch (err) {
    console.error('Admin delete book error:', err.stack || err.message)
    res.status(500).json({ error: 'Failed to delete book' })
  }
})

module.exports = router
