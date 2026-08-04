import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Instagram, Youtube, Facebook, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-green-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="font-accent text-xs tracking-[0.3em] text-green-600 uppercase mb-1">Prophet</div>
            <div className="font-display text-2xl text-gray-900 mb-4">Desmond Obi</div>
            <p className="text-gray-600 text-sm leading-relaxed font-body">
              Commissioned to bring healing, revelation, and divine encounters to this generation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-accent text-xs tracking-[0.2em] text-green-600 uppercase mb-5">Navigate</h4>
            <nav className="flex flex-col gap-3">
              {[['/', 'Home'], ['/about', 'About'],['/sermons', 'Sermons'], ['/books', 'Books'], ['/contact', 'Contact']].map(([href, label]) => (
                <Link key={href} to={href} className="text-gray-600 hover:text-green-600 transition-colors text-sm animated-underline w-fit">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-accent text-xs tracking-[0.2em] text-green-600 uppercase mb-5">Connect</h4>
            <div className="flex gap-4 mb-6">
              {[
                { Icon: Instagram, href: '#' },
                { Icon: Youtube, href: '#' },
                { Icon: Facebook, href: '#' },
                { Icon: Twitter, href: '#' },
              ].map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  whileHover={{ y: -3, color: '#1d6e4d' }}
                  className="text-gray-500 hover:text-green-600 transition-colors">
                
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
            {/* <p className="text-gray-600 text-sm">
              ministry@emmanuelosei.org
            </p> */}
          </div>
        </div>

        <div className="section-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-xs font-body">
          <span>© {new Date().getFullYear()} Prophet Desmond Obi Ministry. All rights reserved.</span>
          <Link to="/admin/login" className="hover:text-green-600 transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
