const path = require('path')
const downloadService = require('../services/download.service')
const Order = require('../models/Order')

/**
 * Handle e-book download and online reading streaming requests
 */
async function downloadBook(req, res, next) {
  try {
    const { token } = req.params
    const email = req.body.email
    const isInline = req.query.inline === 'true' || req.body.inline === 'true'

    // Verify token, email and fetch purchase & book info
    const { book, fileId, gridFsFile, purchase } = await downloadService.verifyDownloadTokenAndEmail(token, email)

    // Determine content type and filename extension
    const contentType = (gridFsFile && gridFsFile.contentType)
      ? gridFsFile.contentType
      : (book.fileMimeType || 'application/pdf')
    
    let extension = '.pdf'
    if (gridFsFile && gridFsFile.filename) {
      const ext = path.extname(gridFsFile.filename).toLowerCase()
      if (ext === '.docx' || ext === '.pdf') {
        extension = ext
      }
    } else if (book.fileExtension) {
      extension = book.fileExtension
    } else if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extension = '.docx'
    }

    const safeTitle = book.title.replace(/[^a-zA-Z0-9-_ ]/g, '') || 'ebook'
    const filename = `${safeTitle}${extension}`
    const encodedFilename = encodeURIComponent(filename)
    
    // Only PDF can be served inline; DOCX must always download as attachment
    const dispositionType = (isInline && extension === '.pdf') ? 'inline' : 'attachment'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${filename}"; filename*=UTF-8''${encodedFilename}`)

    // Disable caching for secure downloads
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')

    // Increment downloadCount in Order
    if (purchase && purchase.paymentReference) {
      Order.updateOne(
        { paymentReference: purchase.paymentReference },
        { $inc: { downloadCount: 1 } }
      ).catch((err) => console.error('[ERROR] [DOWNLOAD_CONTROLLER] Failed to increment downloadCount:', err.message))
    }

    // Open download stream from GridFS
    const downloadStream = downloadService.getDownloadStream(fileId)

    // Handle stream errors
    downloadStream.on('error', (streamErr) => {
      console.error(`[ERROR] [STREAM] GridFS stream failed for fileId ${fileId}:`, streamErr.message)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream the book file' })
      }
    })

    // Pipe directly to response
    downloadStream.pipe(res)

  } catch (err) {
    console.error('[ERROR] [DOWNLOAD_CONTROLLER] Download failed:', err.message)

    // If headers are already sent, let the default error handler handle it
    if (res.headersSent) {
      return next(err)
    }

    const status = err.status || 500
    res.status(status).json({ error: err.message || 'Internal server error' })
  }
}

/**
 * Handle verification of purchase email before download begins
 */
async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params
    const email = req.body.email

    // Validate email, token, and download permissions
    await downloadService.verifyDownloadTokenAndEmail(token, email)

    res.json({ success: true, message: 'Verification successful' })
  } catch (err) {
    console.error('[ERROR] [DOWNLOAD_CONTROLLER] Email verification failed:', err.message)
    const status = err.status || 500
    res.status(status).json({ error: err.message || 'Internal server error' })
  }
}

module.exports = {
  downloadBook,
  verifyEmail
}
