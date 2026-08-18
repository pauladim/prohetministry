const crypto = require('crypto')
const mongoose = require('mongoose')
const Purchase = require('../models/purchase.model')
const Book = require('../models/Book')
const Order = require('../models/Order')

/**
 * Generate a cryptographically secure random token (32 bytes -> 64 chars hex string)
 * @returns {string} The raw download token
 */
function generateDownloadToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a raw token using SHA-256 for secure database storage and comparison
 * @param {string} token - The raw download token
 * @returns {string} The SHA-256 hash of the token in hex format
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Verify download token and email, and return associated book, purchase, and stream metadata
 * @param {string} token - The raw download token
 * @param {string} submittedEmail - The email address submitted for verification
 * @returns {Promise<Object>} Object containing order, purchase, book, fileId, and GridFS file details
 */
async function verifyDownloadTokenAndEmail(token, submittedEmail) {
  if (!token) {
    const err = new Error('Token is required')
    err.status = 400
    throw err
  }

  if (!submittedEmail) {
    const err = new Error('Email is required')
    err.status = 400
    throw err
  }

  // 1. Hash raw token and lookup in Order database
  const hashedToken = hashToken(token)
  const order = await Order.findOne({ downloadToken: hashedToken })
  if (!order) {
    const err = new Error('Invalid download link')
    err.status = 400
    throw err
  }

  // 2. Check that the token has not expired (24-hour limit)
  if (!order.downloadExpiresAt || new Date() > order.downloadExpiresAt) {
    const err = new Error('This download link has expired. Please contact support or request a new download link.')
    err.status = 410 // Gone
    throw err
  }

  // 3. Normalize emails and check that they match
  const normSubmitted = submittedEmail.trim().toLowerCase()
  const normOrder = order.email.trim().toLowerCase()
  if (normSubmitted !== normOrder) {
    const err = new Error('This download link is associated with a different email address.')
    err.status = 403 // Forbidden
    throw err
  }

  // 4. Check order payment status / authorization
  if (order.paymentStatus !== 'completed' && order.orderStatus !== 'paid') {
    const err = new Error('Payment for this book has not been confirmed')
    err.status = 403 // Forbidden
    throw err
  }

  // 5. Fetch catalog book to verify fileId and GridFS file
  const book = await Book.findById(order.bookId)
  if (!book) {
    const err = new Error('The purchased book is no longer available in the catalog')
    err.status = 404
    throw err
  }

  if (!book.fileId || !mongoose.Types.ObjectId.isValid(book.fileId)) {
    const err = new Error('E-book file has not been configured for this book')
    err.status = 404
    throw err
  }

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'ebooks'
  })

  const files = await bucket.find({ _id: new mongoose.Types.ObjectId(book.fileId) }).toArray()
  if (files.length === 0) {
    const err = new Error('The e-book file is missing in database storage')
    err.status = 404
    throw err
  }

  // Fetch purchase details (if any) for incrementing download counts and additional verification
  const purchase = await Purchase.findOne({ paymentReference: order.paymentReference })

  return { order, purchase, book, fileId: book.fileId, gridFsFile: files[0] }
}

/**
 * Create open download stream from GridFS
 * @param {mongoose.Types.ObjectId|string} fileId - GridFS file ID
 * @returns {GridFSBucketReadStream} The GridFS download stream
 */
function getDownloadStream(fileId) {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'ebooks'
  })
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId))
}

module.exports = {
  generateDownloadToken,
  hashToken,
  verifyDownloadTokenAndEmail,
  getDownloadStream
}
