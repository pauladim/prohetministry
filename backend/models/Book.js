const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  description: { type: String, required: true, trim: true },
  coverImage: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS file ID
  pdfFileId: { type: mongoose.Schema.Types.ObjectId, required: function () { return this.type === 'ebook'; } }, // GridFS file ID
  type: { type: String, enum: ['ebook', 'physical'], default: 'ebook' },
  tag: { type: String, default: null }
}, {
  timestamps: true
})

module.exports = mongoose.model('Book', bookSchema)
