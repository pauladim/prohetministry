import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="font-display text-[10rem] leading-none green-text opacity-20 select-none">404</div>
        <h1 className="font-display text-4xl text-gray-900 -mt-6 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">This page does not exist or has been moved.</p>
        <Link to="/" className="btn-primary"><span>Return Home</span></Link>
      </motion.div>
    </div>
  )
}
