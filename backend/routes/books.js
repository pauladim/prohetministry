const router = require('express').Router()
const mongoose = require('mongoose')
const Book = require('../models/Book')

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 })
    res.json(books)
  } catch (err) {
    console.error('Fetch books error:', err.message)
    res.status(500).json({ error: 'Failed to fetch books' })
  }
})

// Get a single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) {
      return res.status(404).json({ error: 'Book not found' })
    }
    res.json(book)
  } catch (err) {
    console.error('Fetch book by ID error:', err.message)
    res.status(500).json({ error: 'Failed to fetch book details' })
  }
})

// router.get("/getBook/:id", async(req, res) => {
//   try {
//     const book = await Book.findById(req.params.id)

//     const bookUrl = `h download/${book._id}`

//   }
// })

// Get book cover image from GridFS
router.get('/cover/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid cover image ID' })
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'covers'
    })

    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray()
    if (files.length === 0) {
      return res.status(404).json({ error: 'Cover image not found' })
    }

    res.setHeader('Content-Type', files[0].contentType || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=31536000') // cache for 1 year since files are permanent

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId))
    downloadStream.on('error', (err) => {
      console.error('Error streaming cover image:', err.message)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream cover image' })
      }
    })
    downloadStream.pipe(res)
  } catch (err) {
    console.error('Fetch cover image error:', err.message)
    res.status(500).json({ error: 'Failed to fetch cover image' })
  }
})

module.exports = router
