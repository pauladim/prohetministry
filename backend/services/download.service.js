const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Purchase = require('../models/purchase.model')
const Book = require('../models/Book')

/**
 * Generate a secure download token that expires in 24 hours
 * @param {Object} purchase - The Purchase document
 * @returns {string} JWT download token
 */
function generateDownloadToken(purchase) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured on the server')
  }

  return jwt.sign(
    {
      purchaseId: purchase._id.toString(),
      bookId: purchase.book.toString(),
      email: purchase.user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
}

/**
 * Verify download token and return associated book, purchase, and stream metadata
 * @param {string} token - The JWT download token
 * @returns {Promise<Object>} Object containing purchase, book, and fileId
 */
async function verifyDownloadToken(token) {
  if (!process.env.JWT_SECRET) {
    const err = new Error('JWT_SECRET is not configured on the server')
    err.status = 500
    throw err
  }

  if (!token) {
    const err = new Error('Token is required')
    err.status = 400
    throw err
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const expiredErr = new Error('Download link has expired (24-hour limit reached)')
      expiredErr.status = 410 // Gone
      throw expiredErr
    }
    const invalidErr = new Error('Invalid download link')
    invalidErr.status = 400 // Bad Request
    throw invalidErr
  }

  const purchase = await Purchase.findById(decoded.purchaseId)
  if (!purchase) {
    const err = new Error('Purchase record not found')
    err.status = 404
    throw err
  }

  // Secure validation: match decoded JWT token payload with purchase record
  if (!purchase.user || purchase.user.email !== decoded.email || !purchase.book || purchase.book.toString() !== decoded.bookId) {
    const err = new Error('Unauthorized download request')
    err.status = 403
    throw err
  }

  if (purchase.paymentStatus !== 'completed') {
    const err = new Error('Payment for this book has not been confirmed')
    err.status = 403 // Forbidden
    throw err
  }

  const book = await Book.findById(purchase.book)
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

  // Verify file exists in GridFS
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'ebooks'
  })

  const files = await bucket.find({ _id: new mongoose.Types.ObjectId(book.fileId) }).toArray()
  if (files.length === 0) {
    const err = new Error('The e-book file is missing in database storage')
    err.status = 404
    throw err
  }

  return { purchase, book, fileId: book.fileId, gridFsFile: files[0] }
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
  verifyDownloadToken,
  getDownloadStream
}
