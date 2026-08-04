const router = require('express').Router()
const axios = require('axios')
const crypto = require('crypto')
const rateLimit = require('express-rate-limit')

const Order = require('../models/Order')
const Book = require('../models/Book')
const {
  sendEbookDownloadEmail,
  sendPhysicalOrderConfirmationEmail
} = require('../utils/email')

const Purchase = require('../models/purchase.model')
const downloadService = require('../services/download.service')
const mongoose = require('mongoose')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { error: 'Too many requests, please try again later' }
})

router.post('/paystack/initialize', limiter, async (req, res) => {
  try {
    const { email, name, bookId } = req.body
    console.log(`[INFO] [PAYSTACK_INITIALIZE] Request: email=${email}, name=${name}, bookId=${bookId}`)

    // Verify that PAYSTACK_SECRET_KEY is loaded correctly from the .env file and is not undefined.
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY.trim() === '') {
      console.error('[ERROR] [PAYSTACK_INITIALIZE] PAYSTACK_SECRET_KEY is undefined or empty in environment.')
      return res.status(500).json({ error: 'Paystack configuration error on server' })
    }

    const book = await Book.findById(bookId)
    if (!book) {
      console.warn(`[WARN] [PAYSTACK_INITIALIZE] Invalid bookId received: ${bookId}`)
      return res.status(404).json({ error: 'Invalid bookId' })
    }

    // Convert book price from USD to NGN using BACKEND exchange rate, then to kobo (* 100)
    const rate = parseFloat(process.env.USD_TO_NGN_RATE) || 1370
    const amountInNgn = book.price * rate
    const amountInKobo = Math.round(amountInNgn * 100)

    console.log(`[INFO] [PAYSTACK_INITIALIZE] Price USD: ${book.price}, Rate: ${rate}, Price NGN: ${amountInNgn}, Amount in kobo: ${amountInKobo}`)

    // Post to the Paystack initialization endpoint
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
        currency: 'NGN',
        metadata: { name, bookId }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    )

    console.log(`[INFO] [PAYSTACK_INITIALIZE] Paystack initialize response reference: ${response.data.data.reference}`)

    // Create order as pending in database
    const order = await Order.create({
      name,
      email,
      bookId,
      bookTitle: book.title,
      bookType: book.type,
      price: book.price, // Storing USD price
      paymentReference: response.data.data.reference,
      paymentGateway: 'paystack',
      paymentProvider: 'paystack',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    })

    console.log(`[INFO] [PAYSTACK_INITIALIZE] Pending order created in DB: orderId=${order._id}, reference=${order.paymentReference}`)

    // Return the reference and converted amount to the client
    res.json({
      reference: response.data.data.reference,
      amount: amountInKobo
    })

  } catch (err) {
    console.error(`[ERROR] [PAYSTACK_INITIALIZE] Paystack initialization failed:`, err.message)
    console.error(`- Status:`, err.response?.status)
    console.error(`- Data:`, err.response?.data)
    res.status(500).json({ error: 'Init failed' })
  }
})

/* ───────────────────────────────
   PAYSTACK: DIRECT VERIFICATION FALLBACK (API fallback)
─────────────────────────────── */
async function verifyPaystackPaymentFallback(reference) {
  console.log(`[INFO] [PAYSTACK_FALLBACK] Verifying reference directly via Paystack API: reference=${reference}`)
  
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    }
  )

  const data = response.data.data
  console.log(`[INFO] [PAYSTACK_FALLBACK] Paystack API status response: reference=${reference}, status=${data.status}`)

  if (data.status !== 'success') {
    console.warn(`[WARN] [PAYSTACK_FALLBACK] Transaction status on Paystack is not success: status=${data.status}`)
    throw new Error('Transaction was not successful on Paystack')
  }

  let order = await Order.findOne({
    paymentReference: reference,
    paymentGateway: 'paystack'
  })

  const bookId = data.metadata?.bookId
  const customerName = data.metadata?.name || data.metadata?.customerName || data.customer?.first_name || 'Customer'
  const customerEmail = data.customer?.email

  if (!order) {
    console.log(`[INFO] [PAYSTACK_FALLBACK] Order not found for reference ${reference}. Creating completed order.`)
    const book = await Book.findById(bookId)
    if (!book) {
      throw new Error(`Book not found for bookId: ${bookId}`)
    }

    order = await Order.create({
      name: customerName,
      email: customerEmail,
      bookId,
      bookTitle: book.title,
      bookType: book.type,
      price: book.price,
      paymentReference: reference,
      paymentGateway: 'paystack',
      paymentProvider: 'paystack',
      paymentStatus: 'completed',
      orderStatus: book.type === 'ebook' ? 'paid' : 'processing',
      transactionId: String(data.id || reference)
    })
    console.log(`[INFO] [PAYSTACK_FALLBACK] Order created: orderId=${order._id}`)
  } else {
    if (order.paymentStatus === 'completed') {
      console.log(`[INFO] [PAYSTACK_FALLBACK] Idempotent skip: Order is already completed in DB for reference: ${reference}`)
      return order
    }

    console.log(`[INFO] [PAYSTACK_FALLBACK] Order found pending. Updating order to completed: reference=${reference}`)
    order.paymentStatus = 'completed'
    const book = await Book.findById(order.bookId)
    order.orderStatus = book && book.type === 'ebook' ? 'paid' : 'processing'
    order.transactionId = String(data.id || reference)
    await order.save()
    console.log(`[INFO] [PAYSTACK_FALLBACK] Order updated successfully in DB: orderId=${order._id}`)
  }

  console.log(`[INFO] [PAYSTACK_FALLBACK] Triggering handleSuccessfulPayment for reference: ${reference}`)
  await handleSuccessfulPayment(order)
  return order
}

router.post('/paystack/verify', async (req, res) => {
  try {
    const { reference } = req.body
    console.log(`[INFO] [POST] /paystack/verify - reference: ${reference}`)

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' })
    }

    const order = await verifyPaystackPaymentFallback(reference)
    res.json({ success: true, order })
  } catch (err) {
    console.error(`[ERROR] [POST] /paystack/verify - failed:`, err.message)
    res.status(400).json({ error: err.message || 'Verification failed' })
  }
})

/* ───────────────────────────────
   POLLING DB FOR WEBHOOK COMPLETION
─────────────────────────────── */
async function checkOrderCompletion(reference, gateway) {
  console.log(`[INFO] [DB_POLLING] Checking completion status for reference: ${reference}, gateway: ${gateway}`)
  let order = await Order.findOne({ paymentReference: reference, paymentGateway: gateway })
  if (!order) {
    console.warn(`[WARN] [DB_POLLING] Order not found in database for reference: ${reference}`)
    return null
  }

  // Poll database for up to 3 seconds (6 attempts x 500ms) to check if webhook has completed it
  if (order.paymentStatus === 'pending') {
    console.log(`[INFO] [DB_POLLING] Order is pending. Starting database polling loop (up to 3 seconds)...`)
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      order = await Order.findOne({ paymentReference: reference, paymentGateway: gateway })
      console.log(`[INFO] [DB_POLLING] Attempt ${i + 1}: paymentStatus=${order ? order.paymentStatus : 'null'}`)
      if (order && order.paymentStatus === 'completed') {
        console.log(`[INFO] [DB_POLLING] Webhook completed order! Exiting loop.`)
        break
      }
    }
  }
  return order
}

/* ───────────────────────────────
   STRIPE: CREATE CHECKOUT SESSION
 ─────────────────────────────── */
router.post('/stripe/create-session', limiter, async (req, res) => {
  try {
    const { email, name, bookId } = req.body
    console.log(`[INFO] POST /stripe/create-session - email: ${email}, name: ${name}, bookId: ${bookId}`)

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[ERROR] Stripe Secret Key is missing')
      return res.status(500).json({ error: 'Stripe is not configured on server' })
    }

    const book = await Book.findById(bookId)
    if (!book) {
      console.warn(`[WARN] Invalid bookId received: ${bookId}`)
      return res.status(404).json({ error: 'Invalid bookId' })
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: book.title,
              description: book.type === 'ebook' ? 'Digital E-Book' : 'Physical Book',
            },
            unit_amount: Math.round(book.price * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/books`,
      customer_email: email,
      metadata: {
        bookId,
        customerName: name,
        customerEmail: email
      },
      payment_intent_data: {
        metadata: {
          bookId,
          customerName: name,
          customerEmail: email
        }
      }
    })

    // Create the order as pending
    await Order.create({
      name,
      email,
      bookId,
      bookTitle: book.title,
      bookType: book.type,
      price: book.price,
      paymentReference: session.id,
      paymentGateway: 'stripe',
      paymentProvider: 'stripe',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    })

    res.json({ id: session.id, url: session.url })

  } catch (err) {
    console.error(`[ERROR] Stripe checkout session creation failed:`, err.message)
    res.status(500).json({ error: 'Failed to create payment session' })
  }
})

/* ───────────────────────────────
   STRIPE: WEBHOOK HANDLER
 ─────────────────────────────── */
/* ───────────────────────────────
   STRIPE: WEBHOOK HANDLER
 ─────────────────────────────── */
router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error(`[ERROR] Stripe webhook signature verification failed:`, err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log(`[INFO] Received Stripe webhook event: ${event.type}`)

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const reference = session.id
      const bookId = session.metadata.bookId
      const customerName = session.metadata.customerName
      const customerEmail = session.metadata.customerEmail || session.customer_details?.email

      const book = await Book.findById(bookId)
      if (!book) {
        console.error(`[ERROR] Resolved book not found in catalog for bookId: ${bookId}`)
        return res.status(400).json({ error: 'Book not found' })
      }

      let order = await Order.findOne({
        paymentReference: reference,
        paymentGateway: 'stripe'
      })

      if (order) {
        if (order.paymentStatus === 'completed') {
          console.log(`[INFO] Stripe order already completed in DB for reference: ${reference}`)
          return res.json({ received: true })
        }
        order.paymentStatus = 'completed'
        order.orderStatus = book.type === 'ebook' ? 'paid' : 'processing'
        order.transactionId = session.payment_intent
        order.paymentProvider = 'stripe'
        await order.save()
      } else {
        // Upsert/Create missing order
        order = await Order.create({
          name: customerName,
          email: customerEmail,
          bookId,
          bookTitle: book.title,
          bookType: book.type,
          price: book.price,
          paymentReference: reference,
          paymentGateway: 'stripe',
          paymentProvider: 'stripe',
          paymentStatus: 'completed',
          orderStatus: book.type === 'ebook' ? 'paid' : 'processing',
          transactionId: session.payment_intent
        })
      }

      console.log(`[INFO] Stripe Order updated/created via webhook: orderId=${order._id}`)
      await handleSuccessfulPayment(order)

    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object
      const paymentIntentId = paymentIntent.id

      // Retrieve session to map to order reference
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1
      })

      let sessionRef = null
      if (sessions.data && sessions.data.length > 0) {
        sessionRef = sessions.data[0].id
      }

      let order
      if (sessionRef) {
        order = await Order.findOne({
          paymentReference: sessionRef,
          paymentGateway: 'stripe'
        })
      }

      if (order) {
        order.paymentStatus = 'failed'
        order.orderStatus = 'cancelled'
        order.transactionId = paymentIntentId
        await order.save()
        console.log(`[INFO] Stripe Order marked as failed via webhook: orderId=${order._id}`)
      } else {
        console.warn(`[WARN] No order found for failed payment intent: ${paymentIntentId}`)
      }
    }

    res.json({ received: true })

  } catch (err) {
    console.error(`[ERROR] Stripe webhook handling error:`, err.message)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/* ───────────────────────────────
   PAYSTACK: WEBHOOK HANDLER
 ─────────────────────────────── */
router.post('/paystack/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature']
    if (!signature) {
      console.warn('[WARN] Paystack webhook signature missing')
      return res.status(400).send('Signature missing')
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(req.rawBody)
      .digest('hex')

    if (hash !== signature) {
      console.warn('[WARN] Paystack webhook signature verification failed')
      return res.status(401).send('Invalid signature')
    }

    const { event, data } = req.body
    console.log(`[INFO] Received Paystack webhook event: ${event}`)

    if (event === 'charge.success' && data.status === 'success') {
      const reference = data.reference
      const bookId = data.metadata?.bookId
      const customerName = data.metadata?.name || data.customer?.first_name || 'Customer'
      const customerEmail = data.customer?.email

      if (!bookId) {
        console.error(`[ERROR] Missing bookId in Paystack metadata for reference: ${reference}`)
        return res.status(400).send('Missing bookId in metadata')
      }

      const book = await Book.findById(bookId)
      if (!book) {
        console.error(`[ERROR] Book not found for bookId: ${bookId}`)
        return res.status(404).send('Book not found')
      }

      let order = await Order.findOne({
        paymentReference: reference,
        paymentGateway: 'paystack'
      })

      if (order) {
        if (order.paymentStatus === 'completed') {
          console.log(`[INFO] Paystack order already completed in DB for reference: ${reference}`)
          return res.json({ received: true })
        }
        order.paymentStatus = 'completed'
        order.orderStatus = book.type === 'ebook' ? 'paid' : 'processing'
        order.transactionId = String(data.id || reference)
        order.paymentProvider = 'paystack'
        await order.save()
      } else {
        order = await Order.create({
          name: customerName,
          email: customerEmail,
          bookId,
          bookTitle: book.title,
          bookType: book.type,
          price: book.price,
          paymentReference: reference,
          paymentGateway: 'paystack',
          paymentProvider: 'paystack',
          paymentStatus: 'completed',
          orderStatus: book.type === 'ebook' ? 'paid' : 'processing',
          transactionId: String(data.id || reference)
        })
      }

      console.log(`[INFO] Paystack Order completed via webhook: orderId=${order._id}`)
      await handleSuccessfulPayment(order)
    }

    res.json({ received: true })
  } catch (err) {
    console.error('[ERROR] Paystack webhook error:', err.message)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/* ───────────────────────────────
   UNIFIED VERIFY PAYMENT (Called by PaymentSuccess page)
─────────────────────────────── */
router.post('/verify', async (req, res) => {
  try {
    const { reference, gateway } = req.body
    console.log(`[INFO] POST /verify - reference: ${reference}, gateway: ${gateway}`)

    if (gateway === 'paystack') {
      let order = await Order.findOne({ paymentReference: reference, paymentGateway: 'paystack' })
      if (order && order.paymentStatus === 'completed') {
        console.log(`[INFO] [/verify] Paystack order is already marked completed in DB: ${reference}`)
        return res.json({ success: true, order })
      }

      console.log(`[INFO] [/verify] Order is pending or missing in DB. Running Paystack API fallback verification...`)
      order = await verifyPaystackPaymentFallback(reference)
      return res.json({ success: true, order })
    } else {
      const order = await checkOrderCompletion(reference, gateway)
      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      if (order.paymentStatus === 'completed') {
        return res.json({ success: true, order })
      } else {
        return res.status(400).json({ error: 'Payment verification pending or failed', order })
      }
    }
  } catch (err) {
    console.error(`[ERROR] Verification failed:`, err.message)
    res.status(500).json({ error: err.message || 'Verification failed' })
  }
})

/* ───────────────────────────────
   PAYMENT SUCCESS HANDLER (Webhook single source of truth)
─────────────────────────────── */
async function handleSuccessfulPayment(order) {
  try {
    const baseUrl = process.env.BACKEND_URL || process.env.EBOOK_BASE_URL || 'http://localhost:5000'

    console.log(`[INFO] Handling successful payment logic for reference: ${order.paymentReference}`)

    // 1. Find the Book to link properly
    const book = await Book.findById(order.bookId)
    if (!book) {
      throw new Error(`Catalog book not found for bookId: ${order.bookId}`)
    }

    // 2. Create the Purchase record
    let purchase = await Purchase.findOne({ paymentReference: order.paymentReference })
    if (!purchase) {
      purchase = await Purchase.create({
        user: {
          name: order.name,
          email: order.email
        },
        book: book._id,
        paymentReference: order.paymentReference,
        paymentProvider: order.paymentGateway,
        paymentStatus: 'completed',
        purchaseDate: new Date()
      })
      console.log(`[INFO] Purchase record created: purchaseId=${purchase._id}`)
    }

    // 3. Complete Order & Send Email
    if (order.bookType === 'ebook') {
      // Generate a secure JWT download token expiring in 24 hours
      const token = downloadService.generateDownloadToken(purchase)

      // Update order details
      order.downloadToken = token
      order.downloadExpiresAt = new Date(Date.now() + 24 * 3600000) // 24 hours from now
      order.paymentStatus = 'completed'
      order.orderStatus = 'paid'
      await order.save()

      const downloadUrl = `${baseUrl}/api/download/${token}`
      const readOnlineUrl = `${baseUrl}/api/download/${token}?inline=true`

      await sendEbookDownloadEmail({
        to: order.email,
        name: order.name,
        bookTitle: order.bookTitle,
        downloadUrl,
        readOnlineUrl,
        reference: order.paymentReference
      })

      order.emailStatus = 'sent'
      await order.save()
      console.log(`[INFO] E-book email sent and order updated: orderId=${order._id}`)
    } else {
      order.paymentStatus = 'completed'
      order.orderStatus = 'processing'
      await order.save()

      await sendPhysicalOrderConfirmationEmail({
        to: order.email,
        name: order.name,
        bookTitle: order.bookTitle,
        reference: order.paymentReference
      })
      console.log(`[INFO] Physical book order confirmation email sent: orderId=${order._id}`)
    }
  } catch (err) {
    console.error(`[ERROR] [handleSuccessfulPayment] Flow failed:`, err.message)
  }
}

module.exports = router