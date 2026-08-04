/**
 * Database seeding script — populates MongoDB with initial books catalog
 * and uploads a sample PDF to GridFS for test downloads.
 * Usage: node seed.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const { Readable } = require('stream')
const fs = require('fs')
const path = require('path')
const Book = require('./models/Book')

const BOOKS_TO_SEED = [
  {
    title: 'Portals of Heaven',
    author: 'Prophet Desmond Obi',
    category: 'Prophetic',
    price: 15,
    description: 'Discover the spiritual keys to opening heavenly portals in your life. A prophetic manual that will transform your prayer life and deepen your encounter with God.',
    type: 'ebook',
    tag: 'Bestseller'
  },
  {
    title: "The Seer's Mantle",
    author: 'Prophet Desmond Obi',
    category: 'Prophetic',
    price: 18,
    description: 'A comprehensive guide to developing and stewarding prophetic sight. Learn to interpret visions, dreams, and spiritual encounters with biblical accuracy.',
    type: 'ebook',
    tag: 'New Release'
  },
  {
    title: 'Covenant Prayers',
    author: 'Prophet Desmond Obi',
    category: 'Prayer',
    price: 12,
    description: "A powerful 40-day journey of prophetic prayer and intercession. Each day unlocks new dimensions of God's covenant promises over your life.",
    type: 'ebook',
    tag: null
  },
  {
    title: 'Voices of Destiny',
    author: 'Prophet Desmond Obi',
    category: 'Destiny',
    price: 35,
    description: 'A landmark work on understanding and walking in your God-ordained destiny. Beautifully designed hardcover edition with study guides and reflection questions.',
    type: 'physical',
    tag: 'Hardcover'
  },
  {
    title: 'Fire & Glory',
    author: 'Prophet Desmond Obi',
    category: 'Revival',
    price: 28,
    description: 'A prophetic prayer manual specifically written for the African continent. Contains powerful territorial warfare prayers, declarations, and revival strategies.',
    type: 'physical',
    tag: null
  },
  {
    title: 'The Prophetic Anointing',
    author: 'Prophet Desmond Obi',
    category: 'Ministry',
    price: 32,
    description: 'Used in Bible schools across Africa, this comprehensive training manual equips ministers to operate in the prophetic office with integrity and power.',
    type: 'physical',
    tag: 'Ministry Resource'
  }
]

async function seed() {
  console.log('🌟 Starting Database Seeding...\n')

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is missing!')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clean existing books
    await Book.deleteMany({})
    console.log('🗑️  Cleared existing books collection')

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Write a dummy 1x1 transparent PNG file for seeded cover images
    const dummyCoverBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    )
    const coverPath = '/uploads/seeded-cover.png'
    fs.writeFileSync(path.join(uploadsDir, 'seeded-cover.png'), dummyCoverBuffer)
    console.log('🖼️  Seeded placeholder cover image created')

    // Prepare a dummy PDF in memory and upload it to GridFS
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'ebooks'
    })

    // Delete existing files in ebooks GridFS bucket
    try {
      const files = await bucket.find({}).toArray()
      for (const file of files) {
        await bucket.delete(file._id)
      }
      console.log('🗑️  Cleared existing GridFS ebook files')
    } catch (err) {
      console.log('⚠️  No existing GridFS files to clear or bucket empty')
    }

    // Upload dummy PDF content
    const dummyPdfContent = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 54 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Prophet Desmond Obi - Seeded E-Book) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n317\n%%EOF'
    )

    const uploadPdf = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream('seeded-ebook-sample.pdf', {
          contentType: 'application/pdf'
        })
        Readable.from(dummyPdfContent)
          .pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => resolve(uploadStream.id))
      })
    }

    const pdfFileId = await uploadPdf()
    console.log(`📄 Seeded sample PDF uploaded to GridFS with ID: ${pdfFileId}`)

    // Create books
    for (const item of BOOKS_TO_SEED) {
      const bookData = {
        ...item,
        coverImage: coverPath
      }

      if (item.type === 'ebook') {
        bookData.pdfFileId = pdfFileId
      }

      const book = await Book.create(bookData)
      console.log(`📚 Created book: "${book.title}" (${book.type})`)
    }

    console.log('\n✨ Database seeding completed successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

seed()
