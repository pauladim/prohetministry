import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { data: res } = await axios.post('/api/admin/login', data)
      login(res.token)
      toast.success('Welcome, Administrator')
      navigate('/admin/dashboard')
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-gray-800 border border-green-800/30 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:border-green-600/60 transition-colors"

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(16,185,129,0.06),transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm relative"
      >
        <div className="text-center mb-8">
          <div className="font-accent text-xs tracking-[0.4em] text-green-500 uppercase mb-2">Ministry Admin</div>
          <h1 className="font-display text-3xl text-gray-100">Secure Login</h1>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-green-800/20">
          <div className="w-14 h-14 rounded-full border border-green-600/30 flex items-center justify-center mx-auto mb-6"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent)' }}>
            <Lock size={22} className="text-green-400" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 font-accent tracking-wider uppercase mb-2">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600/50" />
                <input {...register('email', { required: 'Required' })} type="email" className={inputClass + ' pl-10'} placeholder="admin@ministry.org" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-accent tracking-wider uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600/50" />
                <input {...register('password', { required: 'Required' })} type={showPwd ? 'text' : 'password'} className={inputClass + ' pl-10 pr-10'} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? <Loader2 size={16} className="animate-spin relative z-10" /> : <Lock size={16} className="relative z-10" />}
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Restricted access — ministry personnel only
        </p>
      </motion.div>
    </div>
  )
}
