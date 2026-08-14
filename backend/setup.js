/**
 * Setup script — run once to verify your environment
 * Usage: node setup.js
 */

require('dotenv').config()
const mongoose = require('mongoose')

async function setup() {
  console.log('\n🌟 Prophet Ministry — Setup Script\n')
  console.log('Checking environment variables...')

  const required = [
    'MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD',
    'STRIPE_SECRET_KEY', 'PAYSTACK_SECRET_KEY',
  ]

  const missing = required.filter(k => !process.env[k])
  if (missing.length) {
    console.error('❌ Missing required env vars:', missing.join(', '))
    console.log('   Copy .env.example to .env and fill in the values.\n')
    process.exit(1)
  }

  console.log('✅ All required env vars present\n')
  console.log(`   Admin Email: ${process.env.ADMIN_EMAIL}`)
  console.log(`   Admin Password: ${'*'.repeat(process.env.ADMIN_PASSWORD.length)}\n`)

  // Test MongoDB connection
  console.log('Testing MongoDB connection...')
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    console.log('✅ MongoDB connected successfully')
    await mongoose.disconnect()
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    console.log('   Please make sure MONGODB_URI is correct and your IP is whitelisted.\n')
    process.exit(1)
  }

  // Check email config
  console.log('\nChecking email configuration...')
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`✅ Email configured: ${process.env.EMAIL_USER}`)
  } else {
    console.warn('⚠️  Email not configured — email delivery will be skipped')
  }

  console.log('\n✨ Setup complete! Start the server with: npm run dev\n')
  console.log('📋 Quick reference:')
  console.log(`   Frontend: http://localhost:${process.env.FRONTEND_PORT || 5173}`)
  console.log(`   Backend:  http://localhost:${process.env.PORT || 5000}`)
  console.log(`   Admin:    http://localhost:${process.env.FRONTEND_PORT || 5173}/admin/login\n`)
}

setup().catch(console.error)
