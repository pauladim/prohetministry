import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, BookOpen, Download, Package, Star } from 'lucide-react'
import axios from 'axios'
import PageWrapper from '../components/ui/PageWrapper'
import ScrollReveal from '../components/ui/ScrollReveal'
import PaymentModal from '../components/ui/PaymentModal'
import BookCover from '../components/ui/BookCover'

function BookCard({ book, onBuy }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl overflow-hidden border border-green-800/15 hover:border-green-600/30 transition-colors duration-300 flex flex-col h-full"
    >
      {/* Book cover */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100 flex items-center justify-center">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <BookCover title={book.title} type={book.type} tag={book.tag} className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/80 via-transparent to-transparent pointer-events-none" />
        {book.pages && (
          <div className="absolute bottom-3 right-3 font-body text-xs text-gray-600 border border-gray-300 px-2 py-0.5 rounded-full bg-white/60 z-10">
            {book.pages}pp
          </div>
        )}
        {book.coverImage && book.tag && (
          <div
            className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-accent tracking-wider z-10 bg-green-600 text-white"
            style={{ fontSize: '9px' }}
          >
            {book.tag.toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="font-accent text-xs tracking-wider text-green-500/70 uppercase mb-1">{book.category} • {book.author}</div>
        <h3 className="font-display text-xl text-gray-900 mb-3">{book.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">{book.description}</p>

        <div className="flex items-center justify-between">
          <div className="font-display text-2xl green-text">${book.price}</div>
          <motion.button
            onClick={() => onBuy(book)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary text-xs px-5 py-2.5"
          >
            <ShoppingBag size={13} className="relative z-10" />
            <span>Buy Now</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Books() {
  const [selectedBook, setSelectedBook] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/books')
        setBooks(data)
      } catch (err) {
        console.error('Error fetching books:', err)
        setError('Failed to load books catalog. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [])

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-green-600/30 border-t-green-600 animate-spin" />
            <p className="text-gray-500 text-sm font-body">Loading catalog...</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="glass-card max-w-md p-8 border border-red-300 text-center rounded-2xl">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="font-display text-xl text-gray-900 mb-2">Error Loading Catalog</h3>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary inline-flex justify-center mx-auto">
              <span>Retry</span>
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const ebooks = books.filter(b => b.type === 'ebook')
  const physicals = books.filter(b => b.type === 'physical')

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-40 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(16,185,129,0.05),transparent)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="font-accent text-xs tracking-[0.4em] text-green-500 uppercase mb-4">Prophetic Literature</div>
            <h1 className="font-display text-5xl md:text-7xl text-gray-900 mb-4">
              Books & <span className="italic green-text">Publications</span>
            </h1>
            <p className="text-gray-700 max-w-xl mx-auto">
              Prophetically inspired literature designed to unlock your spiritual inheritance and deepen your encounter with God.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[60px] z-30 bg-white/95 backdrop-blur-xl border-b border-green-800/15 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-center gap-2">
          {[
            { id: 'all', label: 'All Books', icon: BookOpen },
            { id: 'ebook', label: 'E-Books', icon: Download },
            { id: 'physical', label: 'Physical Books', icon: Package },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-body transition-all duration-300 ${
                activeTab === id
                  ? 'bg-green-600 text-white font-medium'
                  : 'text-gray-700 hover:text-gray-900 border border-green-800/20 hover:border-green-600/30'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {(activeTab === 'all' || activeTab === 'ebook') && (
            <div>
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-8 h-8 rounded-full border border-green-600/30 flex items-center justify-center">
                    <Download size={14} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl text-gray-900">Digital E-Books</h2>
                    <p className="text-gray-500 text-sm">Instant download after purchase</p>
                  </div>
                </div>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ebooks.map((book, i) => (
                  <ScrollReveal key={book._id} delay={i * 0.1}>
                    <BookCard book={book} onBuy={setSelectedBook} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'physical') && (
            <div>
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-8 h-8 rounded-full border border-green-600/30 flex items-center justify-center">
                    <Package size={14} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl text-gray-900">Physical Books</h2>
                    <p className="text-gray-500 text-sm">Shipped directly to your door</p>
                  </div>
                </div>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {physicals.map((book, i) => (
                  <ScrollReveal key={book._id} delay={i * 0.1}>
                    <BookCard book={book} onBuy={setSelectedBook} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Payment Modal */}
      {selectedBook && (
        <PaymentModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </PageWrapper>
  )
}
