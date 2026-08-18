const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  // Customer info
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },

  // Book info
  bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  bookType: { type: String, enum: ['ebook', 'physical'], required: true },
  price: { type: Number, required: true },

  // Payment
  paymentReference: { type: String, required: true },
  paymentGateway: { type: String, enum: ['stripe', 'paystack'], required: true },
  paymentProvider: { type: String, enum: ['stripe', 'paystack'], required: true, default: 'paystack' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String },
  
  // Unified order lifecycle
  orderStatus: { type: String, enum: ['pending', 'paid', 'processing', 'completed', 'cancelled'], default: 'pending' },

  // E-book specific
  emailStatus: { type: String, enum: ['not_sent', 'sent', 'failed'], default: 'not_sent' },
  downloadToken: { type: String },
  downloadCount: { type: Number, default: 0 },
  downloadTokenCreatedAt: { type: Date },
  downloadExpiresAt: { type: Date },
  filePath: { type: String },

  // Physical book specific
  delivery: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    country: String,
    deliveryStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered'], default: 'pending' },
  },
}, {
  timestamps: true,
})

// Indexes
orderSchema.index({ email: 1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ orderStatus: 1 })
orderSchema.index({ bookType: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ paymentReference: 1, paymentGateway: 1 }, { unique: true })
orderSchema.index({ downloadToken: 1 })

module.exports = mongoose.model('Order', orderSchema)
