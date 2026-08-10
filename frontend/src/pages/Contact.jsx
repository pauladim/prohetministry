import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import PageWrapper from '../components/ui/PageWrapper'
import ScrollReveal from '../components/ui/ScrollReveal'

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, data)
      toast.success('Message sent! We will respond shortly.')
      reset()
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border border-green-300 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-40 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(29,110,77,0.1),transparent)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="font-accent text-xs tracking-[0.4em] text-green-600 uppercase mb-4">Get In Touch</div>
            <h1 className="font-display text-5xl md:text-7xl text-gray-900 mb-4">
              Connect With <span className="italic green-text">Us</span>
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Whether you seek prayer, a prophetic word, or wish to invite the ministry  we would love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <ScrollReveal>
              <h2 className="font-display text-3xl text-gray-900 mb-6">Ministry <span className="italic green-text">Details</span></h2>
              {[
                { icon: Mail, label: 'Email', value: 'Bishopdesy@gmail.com' },
                { icon: Phone, label: 'Phone', value: '+2349053333770' },
                { icon: MapPin, label: 'Location', value: 'Lagos, Nigeria\nWest Africa' },
              ].map(({ icon: Icon, label, value }) => (
                <motion.div
                  key={label}
                  whileHover={{ x: 4 }}
                  className="flex gap-4 p-5 glass-card rounded-xl border border-green-200 hover:border-green-400 transition-all"
                >
                  <div className="w-10 h-10 rounded-full border border-green-300 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-accent text-xs tracking-wider text-green-600 uppercase mb-1">{label}</div>
                    <div className="text-gray-800 text-sm whitespace-pre-line">{value}</div>
                  </div>
                </motion.div>
              ))}
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass-card rounded-xl p-6 border border-green-200">
                <h4 className="font-display text-lg text-gray-900 mb-3">Book the Prophet</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To invite Prophet Desmond for conferences, crusades, or special services, please use the contact form and indicate the nature of the event.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Form */}
          <ScrollReveal className="md:col-span-3" direction="left">
            <div className="glass-card rounded-2xl p-8 border border-green-200">
              <h3 className="font-display text-2xl text-gray-900 mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">Full Name</label>
                    <input {...register('name', { required: 'Required' })} className={inputClass} placeholder="Your name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">Email</label>
                    <input {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} type="email" className={inputClass} placeholder="your@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">Subject</label>
                  <select {...register('subject', { required: 'Required' })} className={inputClass}>
                    <option value="">Select a subject</option>
                    <option value="prayer">Prayer Request</option>
                    <option value="prophetic">Prophetic Session</option>
                    <option value="booking">Book the Prophet</option>
                    <option value="books">Books Enquiry</option>
                    <option value="general">General Enquiry</option>
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 font-accent tracking-wider uppercase mb-2">Message</label>
                  <textarea {...register('message', { required: 'Required', minLength: { value: 20, message: 'At least 20 characters' } })} rows={6} className={inputClass + ' resize-none'} placeholder="Share your heart with us..." />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? <Loader2 size={16} className="animate-spin relative z-10" /> : <Send size={16} className="relative z-10" />}
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageWrapper>
  )
}
