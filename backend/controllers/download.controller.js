const downloadService = require('../services/download.service')

/**
 * Handle e-book download and online reading streaming requests
 */
async function downloadBook(req, res, next) {
  try {
    const { token } = req.params
    const isInline = req.query.inline === 'true'

    // Verify token and fetch purchase & book info
    const { book, pdfFileId } = await downloadService.verifyDownloadToken(token)

    // Set headers
    const filename = `${book.title.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`
    const dispositionType = isInline ? 'inline' : 'attachment'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${filename}"`)
    
    // Disable caching for secure downloads
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')

    // Open download stream from GridFS
    const downloadStream = downloadService.getDownloadStream(pdfFileId)

    // Handle stream errors
    downloadStream.on('error', (streamErr) => {
      console.error(`[ERROR] [STREAM] GridFS stream failed for fileId ${pdfFileId}:`, streamErr.message)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream the book PDF' })
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

module.exports = {
  downloadBook
}
