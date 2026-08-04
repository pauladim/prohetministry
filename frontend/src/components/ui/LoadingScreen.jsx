import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center"
    >
      {/* Pulsing ring */}
      <div className="relative flex items-center justify-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-24 h-24 rounded-full border border-green-600/30"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute w-16 h-16 rounded-full border border-green-500/40"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-transparent border-t-green-500 border-r-green-400"
        />
        <span className="absolute text-green-400 text-lg">✦</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <div className="font-accent text-xs tracking-[0.4em] text-green-500 uppercase mb-1">Prophet</div>
        <div className="font-display text-xl text-gray-900">Desmond Obi</div>
      </motion.div>
    </motion.div>
  )
}
