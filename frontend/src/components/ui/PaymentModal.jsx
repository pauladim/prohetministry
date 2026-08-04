import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Loader2, Lock, ShieldCheck, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import PaystackPop from '@paystack/inline-js'

export default function PaymentModal({ book, onClose }) {
  const [step, setStep] = useState('info')
  const [paymentRef, setPaymentRef] = useState(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch } = useForm()

  const onInfoSubmit = () => setStep('method')

  const handlePaystack = async (data) => {
    if (!data.name || !data.email) {
      return toast.error('Please fill in all fields')
    }

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!publicKey) return toast.error('Missing Paystack configuration')

    setLoading(true)
    try {
      // 1. Initialize checkout session on the backend
      const { data: initData } = await axios.post('/api/payments/paystack/initialize', {
        email: data.email,
        name: data.name,
        bookId: book._id
      })

      const paystack = new PaystackPop()

      // 2. Open popup inline using reference and NGN kobo amount calculated by backend
      paystack.newTransaction({
        key: publicKey,
        email: data.email,
        amount: initData.amount,
        currency: 'NGN',
        ref: initData.reference,
        metadata: {
          bookId: book._id,
          name: data.name
        },
        onSuccess: (transaction) => {
          toast.success('Payment successful!')
          setTimeout(() => {
            window.location.href = `/payment-success?reference=${transaction.reference}`
          }, 1500)
        },
        onCancel: () => {
          toast.error('Payment cancelled')
          setLoading(false)
        }
      })
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Payment failed to initialize')
      setLoading(false)
    }
  }

  const handleStripe = async (data) => {
    if (!data.name || !data.email) {
      return toast.error('Please fill in all fields')
    }

    setLoading(true)
    try {
      const { data: response } = await axios.post('/api/payments/stripe/create-session', {
        email: data.email,
        name: data.name,
        bookId: book._id
      })

      if (response.url) {
        window.location.href = response.url
      } else {
        toast.error('Failed to create payment session')
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Payment failed to initialize')
      setLoading(false)
    }
  }

  const formData = watch()

  const inputClass = "w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200/50 transition-all duration-300"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-green-600 font-semibold">Checkout</span>
              <h2 className="font-display text-lg text-gray-950 font-semibold line-clamp-1">{book.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            {/* Step: Info Form */}
            {step === 'info' && (
              <form onSubmit={handleSubmit(onInfoSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-accent uppercase tracking-wider text-gray-500 mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('name', { required: true })}
                      placeholder="John Doe"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-accent uppercase tracking-wider text-gray-500 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('email', { required: true })}
                      type="email"
                      placeholder="john@example.com"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-accent text-xs tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md shadow-green-500/10 font-bold hover:shadow-lg hover:shadow-green-500/25"
                >
                  Continue to Payment
                </button>
              </form>
            )}

            {/* Step: Choose Payment Method */}
            {step === 'method' && (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <span className="text-xs text-gray-500 font-medium">Select a payment provider to pay <strong className="green-text text-sm">${book.price}</strong></span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Paystack Button */}
                  <button
                    onClick={() => handlePaystack(formData)}
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-accent text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md shadow-emerald-600/10"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={15} />
                        <span>Pay with Paystack</span>
                      </>
                    )}
                  </button>

                  {/* Stripe Button */}
                  <button
                    onClick={() => handleStripe(formData)}
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-accent text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md shadow-indigo-600/10"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={15} />
                        <span>Pay with Stripe</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Secure checkout verified</span>
                  <span>•</span>
                  <Lock size={11} />
                  <span>SSL Encrypted</span>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto text-green-500 shadow-inner">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-gray-950 font-bold">Payment Successful</h2>
                  <p className="text-xs text-gray-500 mt-1">Ref: {paymentRef}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-accent text-xs tracking-widest uppercase font-bold transition-all duration-300"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}