const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read', 'replied', 'archived'], default: 'unread' },
  replyMessage: { type: String },
  repliedAt: { type: Date },
}, { timestamps: true })

contactSchema.index({ status: 1 })
contactSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Contact', contactSchema)
