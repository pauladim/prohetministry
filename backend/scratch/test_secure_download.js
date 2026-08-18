const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const mongoose = require('mongoose')
const crypto = require('crypto')
const { Writable, Readable } = require('stream')

const Book = require('../models/Book')
const Order = require('../models/Order')
const Purchase = require('../models/purchase.model')
const downloadController = require('../controllers/download.controller')

// ==========================================
// IN-MEMORY DATABASE MOCK LAYER
// ==========================================
console.log('⚡ Initializing in-memory mock database layer...')

const pdfFileId = new mongoose.Types.ObjectId()
const docxFileId = new mongoose.Types.ObjectId()

const database = {
  Book: [],
  Order: [],
  Purchase: []
}

// Mock Mongoose connection
mongoose.connect = async () => {
  console.log('⚡ [MOCK] Mongoose connected successfully (In-Memory).')
}
mongoose.disconnect = async () => {
  console.log('⚡ [MOCK] Mongoose disconnected.')
}

// Mock connection.db property for GridFS Bucket initialization
mongoose.connection = {
  db: {}
}

// Mock Book queries
Book.create = async (doc) => {
  const newDoc = {
    _id: new mongoose.Types.ObjectId(),
    deleteOne: async function() {
      database.Book = database.Book.filter(b => b._id.toString() !== this._id.toString())
    },
    ...doc
  }
  database.Book.push(newDoc)
  return newDoc
}
Book.findById = async (id) => {
  return database.Book.find(b => b._id.toString() === id.toString()) || null
}

// Mock Order queries
Order.create = async (doc) => {
  const newDoc = {
    _id: new mongoose.Types.ObjectId(),
    save: async function() { return this },
    deleteOne: async function() {
      database.Order = database.Order.filter(o => o._id.toString() !== this._id.toString())
    },
    ...doc
  }
  database.Order.push(newDoc)
  return newDoc
}
Order.findOne = async (query) => {
  if (query.downloadToken) {
    return database.Order.find(o => o.downloadToken === query.downloadToken) || null
  }
  return null
}
Order.updateOne = async (query, update) => {
  const order = database.Order.find(o => o.paymentReference === query.paymentReference)
  if (order && update.$inc) {
    order.downloadCount = (order.downloadCount || 0) + (update.$inc.downloadCount || 0)
  }
  return { nModified: order ? 1 : 0 }
}

// Mock Purchase queries
Purchase.create = async (doc) => {
  const newDoc = {
    _id: new mongoose.Types.ObjectId(),
    deleteOne: async function() {
      database.Purchase = database.Purchase.filter(p => p._id.toString() !== this._id.toString())
    },
    ...doc
  }
  database.Purchase.push(newDoc)
  return newDoc
}
Purchase.findOne = async (query) => {
  if (query.paymentReference) {
    return database.Purchase.find(p => p.paymentReference === query.paymentReference) || null
  }
  return null
}

// Mock GridFS Bucket operations
mongoose.mongo = {
  GridFSBucket: class MockGridFSBucket {
    constructor(db, options) {
      this.bucketName = options.bucketName
    }

    find(query) {
      return {
        toArray: async () => {
          const idStr = query._id.toString()
          if (idStr === pdfFileId.toString()) {
            return [{
              _id: pdfFileId,
              filename: 'test_book.pdf',
              contentType: 'application/pdf'
            }]
          } else if (idStr === docxFileId.toString()) {
            return [{
              _id: docxFileId,
              filename: 'test_book.docx',
              contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }]
          }
          return []
        }
      }
    }

    openDownloadStream(fileId) {
      const idStr = fileId.toString()
      let content = ''
      if (idStr === pdfFileId.toString()) {
        content = 'MOCK_PDF_CONTENT'
      } else if (idStr === docxFileId.toString()) {
        content = 'MOCK_DOCX_CONTENT'
      }
      return Readable.from([Buffer.from(content)])
    }

    delete(fileId) {
      return Promise.resolve()
    }
  }
}

// Mock Response class representing Express response object
class MockResponse extends Writable {
  constructor() {
    super()
    this.headers = {}
    this.statusCode = 200
    this.jsonData = null
    this.bodyBuffer = Buffer.alloc(0)
    this.headersSent = false
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value
  }

  status(code) {
    this.statusCode = code
    return this
  }

  json(data) {
    this.jsonData = data
    this.headersSent = true
    this.emit('finish')
    return this
  }

  _write(chunk, encoding, callback) {
    this.headersSent = true
    this.bodyBuffer = Buffer.concat([this.bodyBuffer, chunk])
    callback()
  }
}

async function runTests() {
  console.log('🔄 Connecting to MongoDB (Mocked)...')
  await mongoose.connect()
  console.log('✅ MongoDB connected.')

  let mockPdfBook = null
  let mockDocxBook = null
  let mockPdfOrder = null
  let mockDocxOrder = null
  let mockPdfPurchase = null
  let mockDocxPurchase = null

  try {
    // 1. Create mock Book documents in Catalog
    console.log('📝 Ingesting mock catalog Books...')
    mockPdfBook = await Book.create({
      title: 'MockPDFBook',
      author: 'Test Author',
      category: 'Test Category',
      price: 10,
      description: 'A mock book for testing.',
      coverImage: new mongoose.Types.ObjectId(),
      fileId: pdfFileId,
      fileName: 'test_book.pdf',
      fileMimeType: 'application/pdf',
      fileExtension: '.pdf',
      type: 'ebook'
    })

    mockDocxBook = await Book.create({
      title: 'MockDOCXBook',
      author: 'Test Author',
      category: 'Test Category',
      price: 15,
      description: 'A mock docx book for testing.',
      coverImage: new mongoose.Types.ObjectId(),
      fileId: docxFileId,
      fileName: 'test_book.docx',
      fileMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileExtension: '.docx',
      type: 'ebook'
    })

    // 2. Test Case Setup: Token generation & Hashing
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    // Create Order and Purchase for PDF Book
    mockPdfOrder = await Order.create({
      name: 'Customer A',
      email: 'customerA@gmail.com',
      bookId: mockPdfBook._id.toString(),
      bookTitle: mockPdfBook.title,
      bookType: 'ebook',
      price: 10,
      paymentReference: 'REF_PDF_123',
      paymentGateway: 'stripe',
      paymentProvider: 'stripe',
      paymentStatus: 'completed',
      orderStatus: 'paid',
      downloadToken: hashedToken,
      downloadTokenCreatedAt: new Date(),
      downloadExpiresAt: new Date(Date.now() + 24 * 3600000) // Expires in 24 hours
    })

    mockPdfPurchase = await Purchase.create({
      user: { name: 'Customer A', email: 'customerA@gmail.com' },
      book: mockPdfBook._id,
      paymentReference: 'REF_PDF_123',
      paymentProvider: 'stripe',
      paymentStatus: 'completed',
      purchaseDate: new Date()
    })

    // ==========================================
    // RUN SCENARIOS FOR PDF BOOK
    // ==========================================
    console.log('\n--- Running PDF Ebook Scenarios ---')

    // SCENARIO 1: Wrong email + valid token -> Verification route rejected (HTTP 403)
    console.log('🧪 Scenario 1: Wrong email verification...')
    {
      const req = { params: { token: rawToken }, body: { email: 'customerB@gmail.com' } }
      const res = new MockResponse()
      await downloadController.verifyEmail(req, res, (err) => { if (err) console.error(err) })
      
      console.log(`  -> Verification Status Code: ${res.statusCode}`)
      console.log(`  -> Response JSON:`, res.jsonData)
      if (res.statusCode !== 403 || !res.jsonData.error.includes('associated with a different email')) {
        throw new Error('Scenario 1 failed! Verification should be rejected with 403.')
      }
      console.log('  ✅ Scenario 1: Verification rejected correctly.')
    }

    // SCENARIO 2: Wrong email + valid token -> Download stream route rejected (HTTP 403)
    console.log('🧪 Scenario 2: Wrong email download stream...')
    {
      const req = { params: { token: rawToken }, body: { email: 'customerB@gmail.com' }, query: {} }
      const res = new MockResponse()
      const finishPromise = new Promise(resolve => res.on('finish', resolve))
      
      await downloadController.downloadBook(req, res, (err) => { if (err) console.error(err) })
      await finishPromise

      console.log(`  -> Download Status Code: ${res.statusCode}`)
      console.log(`  -> Response JSON:`, res.jsonData)
      if (res.statusCode !== 403) {
        throw new Error('Scenario 2 failed! Download stream should be rejected with 403.')
      }
      console.log('  ✅ Scenario 2: Download rejected correctly.')
    }

    // SCENARIO 3: Correct email + valid token -> Verification route succeeds (HTTP 200)
    console.log('🧪 Scenario 3: Correct email verification...')
    {
      // Test case-insensitive and whitespace trimming
      const req = { params: { token: rawToken }, body: { email: '  CuStOmErA@gMaIl.CoM  ' } }
      const res = new MockResponse()
      await downloadController.verifyEmail(req, res, (err) => { if (err) console.error(err) })

      console.log(`  -> Verification Status Code: ${res.statusCode}`)
      console.log(`  -> Response JSON:`, res.jsonData)
      if (res.statusCode !== 200 || res.jsonData.success !== true) {
        throw new Error('Scenario 3 failed! Verification should succeed.')
      }
      console.log('  ✅ Scenario 3: Verification succeeded correctly.')
    }

    // SCENARIO 4: Correct email + valid token -> Download stream route succeeds (HTTP 200 + PDF headers)
    console.log('🧪 Scenario 4: Correct email download stream...')
    {
      const req = { params: { token: rawToken }, body: { email: 'customerA@gmail.com' }, query: {} }
      const res = new MockResponse()
      const finishPromise = new Promise(resolve => res.on('finish', resolve))

      await downloadController.downloadBook(req, res, (err) => { if (err) console.error(err) })
      await finishPromise

      console.log(`  -> Download Status Code: ${res.statusCode}`)
      console.log(`  -> Content-Type: ${res.headers['content-type']}`)
      console.log(`  -> Content-Disposition: ${res.headers['content-disposition']}`)
      console.log(`  -> Downloaded Length: ${res.bodyBuffer.length} bytes`)
      
      if (res.statusCode !== 200) {
        throw new Error('Scenario 4 failed! Download stream should succeed.')
      }
      if (res.headers['content-type'] !== 'application/pdf') {
        throw new Error('Scenario 4 failed! Invalid content type.')
      }
      if (!res.headers['content-disposition'].includes('attachment') || !res.headers['content-disposition'].includes('MockPDFBook.pdf')) {
        throw new Error('Scenario 4 failed! Invalid content disposition.')
      }
      if (res.bodyBuffer.toString() !== 'MOCK_PDF_CONTENT') {
        throw new Error('Scenario 4 failed! Downloaded content mismatch.')
      }
      console.log('  ✅ Scenario 4: Download streamed and validated successfully.')
    }

    // SCENARIO 4.1: Correct email + valid token + inline=true -> Download stream route succeeds (HTTP 200 + inline PDF header)
    console.log('🧪 Scenario 4.1: Correct email inline PDF stream...')
    {
      const req = { params: { token: rawToken }, body: { email: 'customerA@gmail.com' }, query: { inline: 'true' } }
      const res = new MockResponse()
      const finishPromise = new Promise(resolve => res.on('finish', resolve))

      await downloadController.downloadBook(req, res, (err) => { if (err) console.error(err) })
      await finishPromise

      console.log(`  -> Download Status Code: ${res.statusCode}`)
      console.log(`  -> Content-Disposition: ${res.headers['content-disposition']}`)
      
      if (res.statusCode !== 200 || !res.headers['content-disposition'].startsWith('inline')) {
        throw new Error('Scenario 4.1 failed! Inline PDF stream should return inline content disposition.')
      }
      console.log('  ✅ Scenario 4.1: Inline PDF stream configured successfully.')
    }

    // ==========================================
    // RUN SCENARIOS FOR DOCX BOOK
    // ==========================================
    console.log('\n--- Running DOCX Ebook Scenarios ---')

    const rawTokenDocx = crypto.randomBytes(32).toString('hex')
    const hashedTokenDocx = crypto.createHash('sha256').update(rawTokenDocx).digest('hex')

    mockDocxOrder = await Order.create({
      name: 'Customer A',
      email: 'customerA@gmail.com',
      bookId: mockDocxBook._id.toString(),
      bookTitle: mockDocxBook.title,
      bookType: 'ebook',
      price: 15,
      paymentReference: 'REF_DOCX_123',
      paymentGateway: 'stripe',
      paymentProvider: 'stripe',
      paymentStatus: 'completed',
      orderStatus: 'paid',
      downloadToken: hashedTokenDocx,
      downloadTokenCreatedAt: new Date(),
      downloadExpiresAt: new Date(Date.now() + 24 * 3600000)
    })

    mockDocxPurchase = await Purchase.create({
      user: { name: 'Customer A', email: 'customerA@gmail.com' },
      book: mockDocxBook._id,
      paymentReference: 'REF_DOCX_123',
      paymentProvider: 'stripe',
      paymentStatus: 'completed',
      purchaseDate: new Date()
    })

    // SCENARIO 5: Correct email + valid token -> Download DOCX succeeds (Attachment even if inline requested)
    console.log('🧪 Scenario 5: DOCX download stream...')
    {
      const req = { params: { token: rawTokenDocx }, body: { email: 'customerA@gmail.com' }, query: { inline: 'true' } }
      const res = new MockResponse()
      const finishPromise = new Promise(resolve => res.on('finish', resolve))

      await downloadController.downloadBook(req, res, (err) => { if (err) console.error(err) })
      await finishPromise

      console.log(`  -> Download Status Code: ${res.statusCode}`)
      console.log(`  -> Content-Type: ${res.headers['content-type']}`)
      console.log(`  -> Content-Disposition: ${res.headers['content-disposition']}`)
      console.log(`  -> Downloaded Length: ${res.bodyBuffer.length} bytes`)

      if (res.statusCode !== 200) {
        throw new Error('Scenario 5 failed! DOCX download stream should succeed.')
      }
      if (res.headers['content-type'] !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        throw new Error('Scenario 5 failed! Invalid docx content type.')
      }
      if (!res.headers['content-disposition'].startsWith('attachment') || !res.headers['content-disposition'].includes('MockDOCXBook.docx')) {
        throw new Error('Scenario 5 failed! Invalid docx content disposition.')
      }
      if (res.bodyBuffer.toString() !== 'MOCK_DOCX_CONTENT') {
        throw new Error('Scenario 5 failed! DOCX content mismatch.')
      }
      console.log('  ✅ Scenario 5: DOCX download verified and streamed successfully.')
    }

    // ==========================================
    // RUN SCENARIOS FOR EXPIRED TOKEN
    // ==========================================
    console.log('\n--- Running Expired Token Scenarios ---')

    const rawTokenExpired = crypto.randomBytes(32).toString('hex')
    const hashedTokenExpired = crypto.createHash('sha256').update(rawTokenExpired).digest('hex')

    const nowTime = Date.now()
    const expiredOrder = await Order.create({
      name: 'Customer A',
      email: 'customerA@gmail.com',
      bookId: mockPdfBook._id.toString(),
      bookTitle: mockPdfBook.title,
      bookType: 'ebook',
      price: 10,
      paymentReference: 'REF_PDF_EXPIRED',
      paymentGateway: 'stripe',
      paymentProvider: 'stripe',
      paymentStatus: 'completed',
      orderStatus: 'paid',
      downloadToken: hashedTokenExpired,
      downloadTokenCreatedAt: new Date(nowTime - 25 * 3600000), // Created 25 hours ago
      downloadExpiresAt: new Date(nowTime - 1 * 3600000) // Expired 1 hour ago
    })

    const expiredPurchase = await Purchase.create({
      user: { name: 'Customer A', email: 'customerA@gmail.com' },
      book: mockPdfBook._id,
      paymentReference: 'REF_PDF_EXPIRED',
      paymentProvider: 'stripe',
      paymentStatus: 'completed',
      purchaseDate: new Date(nowTime - 25 * 3600000)
    })

    // SCENARIO 6: Correct email + expired token -> Verification rejected (HTTP 410)
    console.log('🧪 Scenario 6: Expired token verification...')
    {
      const req = { params: { token: rawTokenExpired }, body: { email: 'customerA@gmail.com' } }
      const res = new MockResponse()
      await downloadController.verifyEmail(req, res, (err) => { if (err) console.error(err) })

      console.log(`  -> Verification Status Code: ${res.statusCode}`)
      console.log(`  -> Response JSON:`, res.jsonData)
      if (res.statusCode !== 410 || !res.jsonData.error.includes('expired')) {
        throw new Error('Scenario 6 failed! Expired token should return 410.')
      }
      console.log('  ✅ Scenario 6: Expired verification rejected correctly.')
    }

    // SCENARIO 7: Correct email + expired token -> Download rejected (HTTP 410)
    console.log('🧪 Scenario 7: Expired token download...')
    {
      const req = { params: { token: rawTokenExpired }, body: { email: 'customerA@gmail.com' }, query: {} }
      const res = new MockResponse()
      const finishPromise = new Promise(resolve => res.on('finish', resolve))

      await downloadController.downloadBook(req, res, (err) => { if (err) console.error(err) })
      await finishPromise

      console.log(`  -> Download Status Code: ${res.statusCode}`)
      console.log(`  -> Response JSON:`, res.jsonData)
      if (res.statusCode !== 410) {
        throw new Error('Scenario 7 failed! Expired download should return 410.')
      }
      console.log('  ✅ Scenario 7: Expired download stream rejected correctly.')
    }

    // SCENARIO 8: Wrong email + expired token -> Download rejected (HTTP 410)
    console.log('🧪 Scenario 8: Wrong email + expired token download...')
    {
      const req = { params: { token: rawTokenExpired }, body: { email: 'customerB@gmail.com' }, query: {} }
      const res = new MockResponse()
      const finishPromise = new Promise(resolve => res.on('finish', resolve))

      await downloadController.downloadBook(req, res, (err) => { if (err) console.error(err) })
      await finishPromise

      console.log(`  -> Download Status Code: ${res.statusCode}`)
      console.log(`  -> Response JSON:`, res.jsonData)
      if (res.statusCode !== 410) {
        throw new Error('Scenario 8 failed! Expired wrong email download should return 410.')
      }
      console.log('  ✅ Scenario 8: Expired wrong email download stream rejected correctly.')
    }

    // Cleanup expired records
    await expiredOrder.deleteOne()
    await expiredPurchase.deleteOne()

    console.log('\n🌟 ALL INTEGRATION TEST CASES PASSED SUCCESSFULLY! 🌟\n')

  } catch (error) {
    console.error('\n❌ INTEGRATION TEST CASE FAILED:', error.message)
    process.exitCode = 1
  } finally {
    // 5. Cleanup Database
    console.log('🧹 Cleaning up mock test data...')
    if (mockPdfBook) await mockPdfBook.deleteOne()
    if (mockDocxBook) await mockDocxBook.deleteOne()
    if (mockPdfOrder) await mockPdfOrder.deleteOne()
    if (mockDocxOrder) await mockDocxOrder.deleteOne()
    if (mockPdfPurchase) await mockPdfPurchase.deleteOne()
    if (mockDocxPurchase) await mockDocxPurchase.deleteOne()

    console.log('🔌 Disconnecting Mongoose...')
    await mongoose.disconnect()
    console.log('🏁 Cleanup finished. Done.')
  }
}

runTests()
