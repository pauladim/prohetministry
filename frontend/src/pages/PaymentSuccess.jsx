import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { CheckCircle, Loader2, Package, MapPin, Phone, User, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import PageWrapper from '../components/ui/PageWrapper'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying | ebook_success | physical_form | physical_success | error
  const [orderData, setOrderData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const reference = searchParams.get('reference') || searchParams.get('session_id')
  const gateway = searchParams.get('reference') ? 'paystack' : 'stripe'

  useEffect(() => {
    if (!reference) { setStatus('error'); return }
    verifyPayment()
  }, [reference])

  const verifyPayment = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/payments/verify`, { reference, gateway })
      setOrderData(data.order)
      if (data.order.bookType === 'ebook') {
        setStatus('ebook_success')
      } else {
        setStatus('physical_form')
      }
    } catch {
      setStatus('error')
    }
  }

  const onDeliverySubmit = async (formData) => {
    setSubmitting(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/orders/delivery`, { orderId: orderData._id, ...formData })
      toast.success('Delivery details saved!')
      setStatus('physical_success')
    } catch {
      toast.error('Failed to save delivery details. Please contact support.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full bg-white border border-green-300 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-lg">

          {/* Verifying */}
          {status === 'verifying' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <Loader2 size={40} className="animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Verifying your payment...</p>
            </motion.div>
          )}

          {/* Ebook Success */}
          {status === 'ebook_success' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-10 text-center border border-green-400/50">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full border-2 border-green-400/50 flex items-center justify-center mx-auto mb-6"
                style={{ background: 'radial-gradient(circle, rgba(29,110,77,0.15), transparent)' }}
              >
                <CheckCircle size={36} className="text-green-600" />
              </motion.div>
              <div className="font-accent text-xs tracking-[0.4em] text-green-600 uppercase mb-3">Purchase Complete</div>
              <h1 className="font-display text-3xl text-gray-900 mb-4">Thank You!</h1>
              <p className="text-gray-600 leading-relaxed mb-2">
                Your e-book purchase was successful. A download link has been sent to:
              </p>
              <p className="text-green-600 font-medium mb-6">{orderData?.email}</p>
              <p className="text-gray-500 text-sm mb-8">
                Check your inbox (and spam folder) for an email from us with your download link.
              </p>
              <div className="glass-card rounded-xl p-4 mb-8 border border-green-200">
                <div className="text-xs text-gray-500 mb-1">Payment Reference</div>
                <div className="font-body text-sm text-gray-700 font-mono break-all">{reference}</div>
              </div>
              <Link to="/books" className="btn-primary justify-center w-full">
                <span>Browse More Books</span>
              </Link>
            </motion.div>
          )}

          {/* Physical: Delivery Form */}
          {status === 'physical_form' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 border border-green-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-green-400/40 flex items-center justify-center">
                  <Package size={18} className="text-green-600" />
                </div>
                <div>
                  <div className="font-accent text-xs tracking-wider text-green-600 uppercase">Payment Confirmed</div>
                  <h2 className="font-display text-xl text-gray-900">Delivery Information</h2>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-6">Please provide your shipping details so we can deliver your book.</p>

              <form onSubmit={handleSubmit(onDeliverySubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">
                    <User size={10} className="inline mr-1" />Full Name
                  </label>
                  <input {...register('fullName', { required: 'Required' })} className={inputClass} placeholder="Full delivery name" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">
                    <Phone size={10} className="inline mr-1" />Phone Number
                  </label>
                  <input {...register('phone', { required: 'Required' })} className={inputClass} placeholder="+233 00 000 0000" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">
                    <MapPin size={10} className="inline mr-1" />Street Address
                  </label>
                  <input {...register('address', { required: 'Required' })} className={inputClass} placeholder="123 Main Street" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">City</label>
                    <input {...register('city', { required: 'Required' })} className={inputClass} placeholder="Accra" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">
                      <Globe size={10} className="inline mr-1" />Country
                    </label>
                    <input {...register('country', { required: 'Required' })} className={inputClass} placeholder="Ghana" />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center mt-2">
                  {submitting ? <Loader2 size={16} className="animate-spin relative z-10" /> : <Package size={16} className="relative z-10" />}
                  <span>{submitting ? 'Saving...' : 'Confirm Delivery Details'}</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* Physical Success */}
          {status === 'physical_success' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-10 text-center border border-green-400/50">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full border-2 border-green-400/50 flex items-center justify-center mx-auto mb-6"
                style={{ background: 'radial-gradient(circle, rgba(29,110,77,0.15), transparent)' }}
              >
                <CheckCircle size={36} className="text-green-600" />
              </motion.div>
              <div className="font-accent text-xs tracking-[0.4em] text-green-600 uppercase mb-3">Order Confirmed</div>
              <h1 className="font-display text-3xl text-gray-900 mb-4">We're On It!</h1>
              <p className="text-gray-600 leading-relaxed mb-8">
                Your order has been placed and your delivery details saved. We will process and ship your book within 3–5 business days.
              </p>
              <Link to="/books" className="btn-primary justify-center w-full">
                <span>Continue Shopping</span>
              </Link>
            </motion.div>
          )}

          {/* Error */}
          {status === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-10 text-center border border-red-300">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="font-display text-2xl text-gray-900 mb-3">Verification Failed</h2>
              <p className="text-gray-600 mb-6">We could not verify your payment. If you were charged, please contact us with your reference number.</p>
              <Link to="/contact" className="btn-outline inline-flex"><span>Contact Support</span></Link>
            </motion.div>
          )}

        </div>
      </div>
    </PageWrapper>
  )
}
