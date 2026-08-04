const mongoose = require('mongoose')

const purchaseSchema = new mongoose.Schema({
  user: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true }
  },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  paymentReference: { type: String, required: true, unique: true, trim: true },
  paymentProvider: { type: String, enum: ['stripe', 'paystack'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  purchaseDate: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Indexes for fast lookup of purchases by email
purchaseSchema.index({ 'user.email': 1 })

module.exports = mongoose.model('Purchase', purchaseSchema)
