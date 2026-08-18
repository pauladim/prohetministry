import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Download, AlertTriangle, Mail } from 'lucide-react'
import axios from 'axios'
import PageWrapper from '../components/ui/PageWrapper'

export default function DownloadVerification() {
  const { token } = useParams()
  const [searchParams] = useSearchParams()
  const isInline = searchParams.get('inline') === 'true'

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('input') // input | verifying | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('verifying')
    setErrorMessage('')

    try {
      // 1. Submit email verification check
      await axios.post(`${import.meta.env.VITE_API_URL}/api/download/${token}/verify`, {
        email: email.trim()
      })

      // 2. Verification succeeded
      setStatus('success')

      // 3. Trigger programmatic form submission to stream the download securely via POST
      triggerFileDownload(email.trim())

    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Verification failed'
      setErrorMessage(msg)
      setStatus('error')
    }
  }

  const triggerFileDownload = (verifiedEmail) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `${import.meta.env.VITE_API_URL}/api/download/${token}`
    
    const emailInput = document.createElement('input')
    emailInput.type = 'hidden'
    emailInput.name = 'email'
    emailInput.value = verifiedEmail
    form.appendChild(emailInput)

    if (isInline) {
      const inlineInput = document.createElement('input')
      inlineInput.type = 'hidden'
      inlineInput.name = 'inline'
      inlineInput.value = 'true'
      form.appendChild(inlineInput)
      form.target = '_blank'
    }

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  const inputClass = "w-full bg-white border border-green-300 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-lg">
          
          {/* Email Input / Verification Form */}
          {(status === 'input' || status === 'error') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 border border-green-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-green-400/40 flex items-center justify-center">
                  <Download size={18} className="text-green-600" />
                </div>
                <div>
                  <div className="font-accent text-xs tracking-wider text-green-600 uppercase">Ebook Download</div>
                  <h2 className="font-display text-xl text-gray-900">Verify Purchase Email</h2>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Enter the email address you used to purchase this book to authorize your download.
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">
                    <Mail size={10} className="inline mr-1" /> Purchase Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="customer@gmail.com"
                  />
                  {status === 'error' && errorMessage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 mt-3 text-red-600 text-xs">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full justify-center mt-2">
                  <Download size={16} className="relative z-10" />
                  <span>Verify & Download</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* Verifying Spinner */}
          {status === 'verifying' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <Loader2 size={40} className="animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Verifying authorization...</p>
            </motion.div>
          )}

          {/* Success Screen */}
          {status === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-10 text-center border border-green-400/50">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full border-2 border-green-400/50 flex items-center justify-center mx-auto mb-6"
                style={{ background: 'radial-gradient(circle, rgba(29,110,77,0.15), transparent)' }}
              >
                <CheckCircle size={36} className="text-green-600" />
              </motion.div>
              <div className="font-accent text-xs tracking-[0.4em] text-green-600 uppercase mb-3">Verification Successful</div>
              <h1 className="font-display text-3xl text-gray-900 mb-4">Ebook Ready</h1>
              <p className="text-gray-600 leading-relaxed mb-6">
                Your verification was successful. The download stream has been initiated.
              </p>
              
              <div className="space-y-4">
                <button onClick={() => triggerFileDownload(email)} className="btn-primary w-full justify-center">
                  <Download size={16} className="relative z-10" />
                  <span>Restart Download</span>
                </button>
                <Link to="/books" className="btn-outline justify-center w-full block text-center py-3">
                  <span>Browse More Books</span>
                </Link>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </PageWrapper>
  )
}
