const router = require('express').Router()
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

module.exports = router
