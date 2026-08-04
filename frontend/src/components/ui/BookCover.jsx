import { motion } from 'framer-motion'
import { Download, Package } from 'lucide-react'

const COVER_PALETTES = [
  { from: '#f0fdf4', to: '#dcfce7', accent: '#1d6e4d' },
  { from: '#ecfdf5', to: '#d1fae5', accent: '#047857' },
  { from: '#f0f9ff', to: '#dbeafe', accent: '#0369a1' },
  { from: '#fef2f2', to: '#fee2e2', accent: '#991b1b' },
  { from: '#faf5ff', to: '#f3e8ff', accent: '#6b21a8' },
  { from: '#fffbeb', to: '#fef3c7', accent: '#b45309' },
]

/**
 * Deterministic palette based on book title
 */
function getPalette(title = '') {
  const idx = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % COVER_PALETTES.length
  return COVER_PALETTES[idx]
}

export default function BookCover({ title = '', type = 'ebook', tag, className = '' }) {
  const palette = getPalette(title)
  const words = title.split(' ').slice(0, 3)

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${palette.from} 0%, ${palette.to} 100%)` }}
    >
      {/* Decorative radial */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse at 60% 30%, ${palette.accent}, transparent 70%)` }}
      />

      {/* Diagonal line accents */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)`,
              top: `${30 + i * 20}%`,
              left: '-10%',
              right: '-10%',
              transform: `rotate(-8deg)`,
            }}
          />
        ))}
      </div>

      {/* Cross ornament */}
      <div className="relative z-10 mb-4">
        <div
          className="w-12 h-12 rounded-full border flex items-center justify-center"
          style={{ borderColor: `${palette.accent}50` }}
        >
          <span style={{ color: palette.accent, fontSize: '18px' }}>✦</span>
        </div>
      </div>

      {/* Title words stacked */}
      <div className="relative z-10 text-center px-4">
        {words.map((word, i) => (
          <div
            key={i}
            className="font-display leading-tight"
            style={{
              color: i === 0 ? palette.accent : 'rgba(31,41,55,0.85)',
              fontSize: words.length <= 2 ? '14px' : '12px',
              letterSpacing: '0.05em',
            }}
          >
            {word}
          </div>
        ))}
      </div>

      {/* Bottom type indicator */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
          style={{
            background: `${palette.accent}15`,
            border: `1px solid ${palette.accent}30`,
            color: `${palette.accent}`,
          }}
        >
          {type === 'ebook' ? <Download size={9} /> : <Package size={9} />}
          <span className="font-accent tracking-wider" style={{ fontSize: '9px' }}>
            {type === 'ebook' ? 'E-BOOK' : 'PRINT'}
          </span>
        </div>
      </div>

      {/* Tag badge */}
      {tag && (
        <div
          className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-accent tracking-wider"
          style={{ background: palette.accent, color: '#0a0906', fontSize: '9px' }}
        >
          {tag.toUpperCase()}
        </div>
      )}
    </div>
  )
}
