import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, Search, BookOpen, Package, TrendingUp,
  CheckCircle, Clock, XCircle, Download, Filter,
  RefreshCw, ChevronDown, MessageSquare, Mail,
  BarChart2, DollarSign, Eye, X, Plus, Edit, Trash2
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Completed' },
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Pending' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Failed' },
  sent: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Email Sent' },
  not_sent: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Not Sent' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${cfg.color} ${cfg.bg}`}>
      <Icon size={10} />{cfg.label}
    </span>
  )
}

function GatewayBadge({ gateway }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-mono ${gateway === 'paystack' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-500/10 text-indigo-400'
      }`}>{gateway || '—'}</span>
  )
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Mock data (shown when backend not connected) ─────────────────────────────
const MOCK_EBOOKS = [
  { _id: '1', name: 'Grace Mensah', email: 'grace@example.com', book: 'Portals of Heaven', reference: 'PAY-REF-XA001', paymentStatus: 'completed', emailStatus: 'sent', gateway: 'paystack', createdAt: '2024-03-15T10:30:00Z' },
  { _id: '2', name: 'David Asante', email: 'david@example.com', book: "The Seer's Mantle", reference: 'cs_live_XB002', paymentStatus: 'completed', emailStatus: 'sent', gateway: 'stripe', createdAt: '2024-03-14T09:15:00Z' },
  { _id: '3', name: 'Akosua Boateng', email: 'akosua@example.com', book: 'Covenant Prayers', reference: 'PAY-REF-XC003', paymentStatus: 'pending', emailStatus: 'not_sent', gateway: 'paystack', createdAt: '2024-03-13T14:00:00Z' },
  { _id: '4', name: 'James Owusu', email: 'james@example.com', book: 'Portals of Heaven', reference: 'cs_live_XD004', paymentStatus: 'completed', emailStatus: 'sent', gateway: 'stripe', createdAt: '2024-03-12T11:45:00Z' },
  { _id: '5', name: 'Efua Amankwah', email: 'efua@example.com', book: "The Seer's Mantle", reference: 'PAY-REF-XE005', paymentStatus: 'completed', emailStatus: 'sent', gateway: 'paystack', createdAt: '2024-03-11T08:00:00Z' },
  { _id: '6', name: 'Kofi Acheampong', email: 'kofi@example.com', book: 'Covenant Prayers', reference: 'cs_live_XF006', paymentStatus: 'failed', emailStatus: 'not_sent', gateway: 'stripe', createdAt: '2024-03-10T16:20:00Z' },
]

const MOCK_PHYSICAL = [
  { _id: '1', name: 'Abena Ofosu', phone: '+44 7700 900001', address: '12 Kings Road', city: 'London', country: 'United Kingdom', book: 'Voices of Destiny', reference: 'PAY-REF-YA001', paymentStatus: 'completed', gateway: 'paystack', createdAt: '2024-03-15T08:00:00Z' },
  { _id: '2', name: 'Emmanuel Kweku', phone: '+233 244 000001', address: '45 Liberation Road', city: 'Accra', country: 'Ghana', book: 'Fire & Glory', reference: 'cs_live_YB002', paymentStatus: 'completed', gateway: 'stripe', createdAt: '2024-03-14T16:30:00Z' },
  { _id: '3', name: 'Sarah Amoah', phone: '+1 555 000 1234', address: '789 Church Ave', city: 'Atlanta', country: 'United States', book: 'The Prophetic Anointing', reference: 'PAY-REF-YC003', paymentStatus: 'pending', gateway: 'paystack', createdAt: '2024-03-13T12:00:00Z' },
  { _id: '4', name: 'Michael Osei', phone: '+1 416 555 9999', address: '22 Maple Street', city: 'Toronto', country: 'Canada', book: 'Voices of Destiny', reference: 'cs_live_YD004', paymentStatus: 'completed', gateway: 'stripe', createdAt: '2024-03-12T09:00:00Z' },
]

const MOCK_CONTACTS = [
  { _id: '1', name: 'Pastor John Addo', email: 'john@church.org', subject: 'booking', message: 'We would love to have Prophet Emmanuel at our annual convention this September in Kumasi. Please advise on his availability and requirements for the event.', read: false, createdAt: '2024-03-15T10:00:00Z' },
  { _id: '2', name: 'Sister Ruth Boadi', email: 'ruth@example.com', subject: 'prayer', message: 'Requesting urgent prayer for my family. We are going through a very difficult season and need divine intervention and direction from God.', read: true, createdAt: '2024-03-14T08:30:00Z' },
  { _id: '3', name: 'Bishop Frank Asare', email: 'bishop@church.net', subject: 'prophetic', message: 'I would like to schedule a personal prophetic session for myself and my wife. Please let us know your available dates and procedure for booking.', read: false, createdAt: '2024-03-13T14:00:00Z' },
  { _id: '4', name: 'Ama Serwaa', email: 'ama@gmail.com', subject: 'books', message: 'I ordered a physical copy of Voices of Destiny two weeks ago and have not yet received it. My order reference is PAY-REF-YA001. Please assist.', read: true, createdAt: '2024-03-12T11:00:00Z' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, sub, color = 'primary', delay = 0 }) {
  const palette = {
    primary: { ring: 'border-green-600/20', bg: 'bg-green-600/8', text: 'text-green-400' },
    secondary: { ring: 'border-green-600/20', bg: 'bg-green-600/8', text: 'text-green-400' },
    indigo: { ring: 'border-indigo-500/20', bg: 'bg-indigo-500/8', text: 'text-indigo-400' },
    rose: { ring: 'border-rose-500/20', bg: 'bg-rose-500/8', text: 'text-rose-400' },
  }
  const c = palette[color] || palette.primary
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-xl p-5 border border-green-800/15"
    >
      <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.ring} flex items-center justify-center mb-4`}>
        <Icon size={16} className={c.text} />
      </div>
      <div className="font-display text-2xl green-text mb-0.5">{value}</div>
      <div className="text-black text-sm font-semibold">{label}</div>
      {sub && <div className="text-gray-800 text-xs mt-0.5">{sub}</div>}
    </motion.div>
  )
}

function ContactDetailModal({ contact, onClose, onReplySuccess, token }) {
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message')
      return
    }
    setSending(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/contacts/${contact._id}/reply`,
        { replyMessage: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Reply email sent successfully!')
      if (onReplySuccess) {
        onReplySuccess(res.data.contact)
      }
      setReplyText('')
    } catch (err) {
      console.error(err)
      if (!token || err.message === 'Network Error' || err.response?.status === 404) {
        // Fallback for demo / offline mode
        const simulatedContact = {
          ...contact,
          replyMessage: replyText,
          repliedAt: new Date().toISOString(),
          status: 'replied'
        }
        toast.success('Demo: Reply saved successfully!')
        if (onReplySuccess) {
          onReplySuccess(simulatedContact)
        }
        setReplyText('')
      } else {
        toast.error(err.response?.data?.error || 'Failed to send reply email')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass-card rounded-2xl w-full max-w-lg border border-green-700/20 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-green-800/15">
          <div>
            <div className="font-display text-lg text-black font-semibold">{contact.name}</div>
            <div className="text-gray-800 text-xs mt-0.5">{contact.email}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-accent text-xs tracking-wider text-green-600 uppercase px-2.5 py-1 border border-green-600/20 rounded-full">
                {contact.subject}
              </span>
              <span className="text-gray-800 text-xs">{fmtDate(contact.createdAt)}</span>
            </div>
            <div className="p-3 bg-gray-100/50 rounded-lg border border-gray-200">
              <p className="text-black leading-relaxed text-sm font-medium">{contact.message}</p>
            </div>
          </div>

          {contact.replyMessage && (
            <div className="p-4 bg-green-50/70 border border-green-200 rounded-lg">
              <div className="text-xs font-semibold text-green-800 uppercase mb-1">
                Our Reply ({contact.repliedAt ? fmtDate(contact.repliedAt) : 'Recent'}):
              </div>
              <p className="text-black text-sm whitespace-pre-line leading-relaxed font-medium">
                {contact.replyMessage}
              </p>
            </div>
          )}

          {!contact.replyMessage && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-800 uppercase">
                Compose Reply (Send Email):
              </label>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your reply message here... This will be sent as an email to the contact."
                className="w-full h-28 p-3 bg-white border border-gray-300 rounded-lg text-black placeholder:text-gray-400 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none font-sans"
                disabled={sending}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex justify-end gap-2 border-t border-green-800/10">
          <button onClick={onClose} className="btn-outline text-xs px-4 py-2" style={{ padding: '8px 16px', fontSize: '12px' }}>
            <span>Close</span>
          </button>

          {!contact.replyMessage && (
            <>
              <a
                href={`mailto:${contact.email}?subject=Re: Your message — ${contact.subject}`}
                className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
                style={{ padding: '8px 16px', fontSize: '12px', borderColor: '#4b5563', color: '#4b5563' }}
              >
                <Mail size={12} />
                <span>Reply by Email Client</span>
              </a>
              <button
                onClick={handleSendReply}
                disabled={sending || !replyText.trim()}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                <MessageSquare size={12} className="relative z-10" />
                <span>{sending ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Search + Filter bar ──────────────────────────────────────────────────────
function FilterBar({ search, setSearch, statusFilter, setStatusFilter, placeholder }) {
  const cls = "bg-gray-800 border border-green-800/25 rounded-xl text-gray-200 text-sm placeholder:text-gray-500 focus:outline-none focus:border-green-600/50 transition-colors"
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600/50" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder={placeholder}
          className={`${cls} w-full pl-10 pr-4 py-2.5`}
        />
      </div>
      {setStatusFilter && (
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600/50" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className={`${cls} pl-10 pr-8 py-2.5 appearance-none`}>
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      )}
    </div>
  )
}

// ─── Table wrapper ────────────────────────────────────────────────────────────
function DataTable({ headers, children, empty }) {
  return (
    <div className="glass-card rounded-2xl border border-green-800/15 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-800/15">
              {headers.map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-accent tracking-wider text-black font-bold uppercase whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empty
              ? <tr><td colSpan={headers.length} className="text-center py-14 text-black font-semibold text-sm">No records found</td></tr>
              : children
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Book Create/Edit Modal Component ─────────────────────────────────────────
function BookModal({ book, onClose, onSaveSuccess, token }) {
  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState(book?.author || '')
  const [category, setCategory] = useState(book?.category || '')
  const [price, setPrice] = useState(book?.price || '')
  const [description, setDescription] = useState(book?.description || '')
  const [type, setType] = useState(book?.type || 'ebook')
  const [tag, setTag] = useState(book?.tag || '')
  
  const [coverFile, setCoverFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title || !author || !category || !price || !description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!book) {
      // Creation requirements
      if (!coverFile) {
        toast.error('Cover image is required')
        return
      }
      if (type === 'ebook' && !pdfFile) {
        toast.error('PDF file is required for e-books')
        return
      }
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('author', author)
      formData.append('category', category)
      formData.append('price', price)
      formData.append('description', description)
      formData.append('type', type)
      formData.append('tag', tag)

      if (coverFile) {
        formData.append('coverImage', coverFile)
      }
      if (pdfFile && type === 'ebook') {
        formData.append('pdfFile', pdfFile)
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }

      if (book) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/books/${book._id}`, formData, { headers })
        toast.success('Book updated successfully')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/books`, formData, { headers })
        toast.success('Book created successfully')
      }
      onSaveSuccess()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to save book')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass-card rounded-2xl w-full max-w-lg border border-green-700/20 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-green-800/15">
          <div>
            <div className="font-display text-lg text-black font-semibold">{book ? 'Edit Book' : 'Add New Book'}</div>
            <div className="text-gray-800 text-xs mt-0.5">{book ? 'Update catalog item details' : 'Create new catalog item'}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">Book Title *</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:border-green-600 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">Author *</label>
              <input
                type="text" value={author} onChange={e => setAuthor(e.target.value)} required
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:border-green-600 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">Category *</label>
              <input
                type="text" value={category} onChange={e => setCategory(e.target.value)} required
                placeholder="Prophetic"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:border-green-600 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">Price ($) *</label>
              <input
                type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:border-green-600 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">Tag (Badge)</label>
              <input
                type="text" value={tag} onChange={e => setTag(e.target.value)}
                placeholder="Bestseller"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:border-green-600 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">Book Type</label>
              <select
                value={type} onChange={e => setType(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:border-green-600 font-sans"
              >
                <option value="ebook">E-Book (Digital)</option>
                <option value="physical">Physical Book (Print)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">Description *</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} required
              rows="3"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:border-green-600 font-sans resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-green-800/10 pt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">
                Cover Image {book ? '(Optional)' : '*'}
              </label>
              <input
                type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])}
                className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {book && <div className="text-[10px] text-gray-500 mt-1 truncate">Current: {book.coverImage}</div>}
            </div>

            {type === 'ebook' && (
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">
                  PDF E-Book File {book ? '(Optional)' : '*'}
                </label>
                <input
                  type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files[0])}
                  className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {book && book.pdfFileId && <div className="text-[10px] text-gray-500 mt-1 truncate">Has uploaded PDF</div>}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pb-2 pt-4 flex justify-end gap-2 border-t border-green-800/10">
            <button type="button" onClick={onClose} className="btn-outline text-xs px-4 py-2" style={{ padding: '8px 16px', fontSize: '12px' }}>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <span>{saving ? 'Saving...' : 'Save Book'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [ebookOrders, setEbookOrders] = useState(MOCK_EBOOKS)
  const [physicalOrders, setPhysicalOrders] = useState(MOCK_PHYSICAL)
  const [contacts, setContacts] = useState(MOCK_CONTACTS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewContact, setViewContact] = useState(null)

  const [books, setBooks] = useState([])
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  // Reset filters on tab switch
  useEffect(() => { setSearch(''); setStatusFilter('all') }, [activeTab])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const h = { Authorization: `Bearer ${admin?.token}` }
      const [eb, ph, ct, bk] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/orders/ebooks`, { headers: h }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/orders/physical`, { headers: h }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/contacts`, { headers: h }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/books`)
      ])
      if (eb.data?.length) setEbookOrders(eb.data)
      if (ph.data?.length) setPhysicalOrders(ph.data)
      if (ct.data?.length) setContacts(ct.data)
      if (bk.data) setBooks(bk.data)
    } catch {
      // Silent — mock data is already displayed
      toast('Demo data shown — connect backend for live data', { icon: 'ℹ️', duration: 3000 })
    } finally {
      setLoading(false)
    }
  }, [admin])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
    toast.success('Logged out successfully')
  }

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book? This will permanently remove it.')) return
    try {
      const h = { Authorization: `Bearer ${admin?.token}` }
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/books/${id}`, { headers: h })
      toast.success('Book deleted successfully')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete book')
    }
  }

  // Filter helper
  const applyFilters = (arr, searchFields) => arr.filter(o => {
    const q = search.toLowerCase()
    const matchText = !q || searchFields.some(f => (o[f] || '').toLowerCase().includes(q))
    const matchStatus = statusFilter === 'all' || o.paymentStatus === statusFilter
    return matchText && matchStatus
  })

  // Derived stats
  const completedEbooks = ebookOrders.filter(o => o.paymentStatus === 'completed').length
  const completedPhysical = physicalOrders.filter(o => o.paymentStatus === 'completed').length
  const totalRevenue = completedEbooks * 15 + completedPhysical * 31
  const unreadCount = contacts.filter(c => !c.read).length

  const allOrders = [...ebookOrders, ...physicalOrders]
  const paystackCount = allOrders.filter(o => o.gateway === 'paystack').length
  const stripeCount = allOrders.filter(o => o.gateway === 'stripe').length
  const paystackPct = allOrders.length ? Math.round((paystackCount / allOrders.length) * 100) : 0
  const stripePct = allOrders.length ? Math.round((stripeCount / allOrders.length) * 100) : 0

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2, badge: null },
    { id: 'ebooks', label: 'E-Book Orders', icon: BookOpen, badge: ebookOrders.length },
    { id: 'physical', label: 'Physical Orders', icon: Package, badge: physicalOrders.length },
    { id: 'books', label: 'Manage Books', icon: BookOpen, badge: books.length || null },
    { id: 'contacts', label: 'Messages', icon: MessageSquare, badge: unreadCount || null },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden" style={{ height: '100vh' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-60 flex-shrink-0 bg-gray-950 border-r border-green-800/20 hidden md:flex flex-col"
      >
        {/* Brand */}
        <div className="p-6 border-b border-green-800/15">
          <div className="font-accent text-xs tracking-[0.3em] text-green-500 uppercase mb-0.5">Ministry</div>
          <div className="font-display text-lg text-gray-100">Admin Panel</div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeTab === id
                ? 'bg-green-600/15 text-green-400 border border-green-600/25'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/4'
                }`}
            >
              <Icon size={15} />
              <span className="flex-1 text-left font-body">{label}</span>
              {badge != null && (
                <span className={`min-w-[20px] text-center text-xs px-1.5 py-0.5 rounded-full ${activeTab === id
                  ? 'bg-green-600/25 text-green-400'
                  : 'bg-white/8 text-gray-500'
                  }`}>{badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-green-800/15">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut size={15} />
            <span className="font-body">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 bg-gray-900/95 backdrop-blur-xl border-b border-green-800/15 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-gray-100">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Prophet Desmond Obi Ministry</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={fetchData}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-500 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-white/5"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </motion.button>
            {/* Mobile logout */}
            <button onClick={handleLogout} className="md:hidden text-gray-500 hover:text-red-400 transition-colors p-2">
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ─────────────────────────────── */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="E-Book Sales" value={completedEbooks} icon={BookOpen} sub="payments confirmed" color="primary" delay={0} />
                    <StatCard label="Physical Orders" value={completedPhysical} icon={Package} sub="payments confirmed" color="primary" delay={0.05} />
                    <StatCard label="Est. Revenue" value={`$${totalRevenue}`} icon={DollarSign} sub="USD (approximate)" color="blue" delay={0.1} />
                    <StatCard label="New Messages" value={unreadCount} icon={MessageSquare} sub="unread" color="purple" delay={0.15} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent e-book orders */}
                    <div className="glass-card rounded-2xl border border-green-800/15 overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-green-800/10">
                        <h3 className="font-display text-base text-black-100">Recent E-Book Orders</h3>
                        <button
                          onClick={() => setActiveTab('ebooks')}
                          className="text-green-500/50 hover:text-green-400 text-xs transition-colors font-body"
                        >
                          View all →
                        </button>
                      </div>
                      <div className="divide-y divide-green-800/10">
                        {ebookOrders.slice(0, 5).map(o => (
                          <div key={o._id} className="flex items-center gap-3 px-5 py-3">
                            <div className="w-8 h-8 rounded-full border border-green-600/20 bg-green-600/8 flex items-center justify-center flex-shrink-0">
                              <span className="text-green-400 text-xs font-display">{o.name[0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-black text-sm font-semibold truncate">{o.name}</div>
                              <div className="text-gray-800 text-xs truncate">{o.book}</div>
                            </div>
                            <StatusBadge status={o.paymentStatus} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent messages */}
                    <div className="glass-card rounded-2xl border border-green-800/15 overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-green-800/10">
                        <h3 className="font-display text-base text-black-100">Recent Messages</h3>
                        <button
                          onClick={() => setActiveTab('contacts')}
                          className="text-green-500/50 hover:text-green-400 text-xs transition-colors font-body"
                        >
                          View all →
                        </button>
                      </div>
                      <div className="divide-y divide-green-800/10">
                        {contacts.slice(0, 5).map(c => (
                          <button
                            key={c._id}
                            onClick={() => { setViewContact(c); setActiveTab('contacts') }}
                            className="w-full flex items-start gap-3 px-5 py-3 hover:bg-white/3 transition-colors text-left"
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.read ? 'bg-green-800/30' : 'bg-green-400'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-black text-sm font-semibold truncate">{c.name}</div>
                              <div className="text-gray-800 text-xs truncate">{c.message}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Gateway breakdown */}
                  <div className="glass-card rounded-2xl border border-green-800/15 p-6">
                    <h3 className="font-display text-base text-gray-100 mb-5">Payment Gateway Split</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { gw: 'paystack', count: paystackCount, pct: paystackPct, clr: 'bg-cyan-500', txt: 'text-cyan-400' },
                        { gw: 'stripe', count: stripeCount, pct: stripePct, clr: 'bg-indigo-500', txt: 'text-indigo-400' },
                      ].map(({ gw, count, pct, clr, txt }) => (
                        <div key={gw} className="p-4 rounded-xl border border-green-800/10 bg-gray-800/30">
                          <div className="flex items-center justify-between mb-3">
                            <GatewayBadge gateway={gw} />
                            <span className={`text-sm font-medium ${txt}`}>{count} orders</span>
                          </div>
                          <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, delay: 0.4 }}
                              className={`h-full rounded-full ${clr}`}
                            />
                          </div>
                          <div className="text-gray-800 text-xs mt-1.5">{pct}% of all orders</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── E-BOOK ORDERS ────────────────────────── */}
              {activeTab === 'ebooks' && (
                <motion.div
                  key="ebooks"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <FilterBar
                    search={search} setSearch={setSearch}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    placeholder="Search name, email, book, reference.."
                  />
                  {(() => {
                    const rows = applyFilters(ebookOrders, ['name', 'email', 'book', 'reference'])
                    return (
                      <DataTable
                        headers={['Customer', 'Book', 'Payment', 'Email Delivery', 'Gateway', 'Date']}
                        empty={rows.length === 0}
                      >
                        {rows.map((o, i) => (
                          <motion.tr
                            key={o._id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-green-800/8 hover:bg-green-600/4 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-black text-sm">{o.name}</div>
                              <div className="text-gray-800 text-xs">{o.email}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-black text-sm">{o.book}</div>
                              <div className="font-mono text-gray-800 text-xs">{(o.reference || '').slice(0, 18)}</div>
                            </td>
                            <td className="px-5 py-3.5"><StatusBadge status={o.paymentStatus} /></td>
                            <td className="px-5 py-3.5"><StatusBadge status={o.emailStatus} /></td>
                            <td className="px-5 py-3.5"><GatewayBadge gateway={o.gateway} /></td>
                            <td className="px-5 py-3.5 text-gray-800 text-xs whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                          </motion.tr>
                        ))}
                      </DataTable>
                    )
                  })()}
                </motion.div>
              )}

              {/* ── PHYSICAL ORDERS ──────────────────────── */}
              {activeTab === 'physical' && (
                <motion.div
                  key="physical"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <FilterBar
                    search={search} setSearch={setSearch}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    placeholder="Search name, phone, book, reference…"
                  />
                  {(() => {
                    const rows = applyFilters(physicalOrders, ['name', 'phone', 'book', 'reference', 'city', 'country'])
                    return (
                      <DataTable
                        headers={['Customer', 'Book', 'Delivery Address', 'Payment', 'Gateway', 'Date']}
                        empty={rows.length === 0}
                      >
                        {rows.map((o, i) => (
                          <motion.tr
                            key={o._id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-green-800/8 hover:bg-green-600/4 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-black text-sm">{o.name}</div>
                              <div className="text-gray-800 text-xs">{o.phone}</div>
                            </td>
                            <td className="px-5 py-3.5 text-black text-sm">{o.book}</td>
                            <td className="px-5 py-3.5">
                              <div className="text-gray-800 text-xs leading-relaxed">
                                {o.address && <div className="truncate max-w-[140px]">{o.address}</div>}
                                <div>{o.city}, {o.country}</div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5"><StatusBadge status={o.paymentStatus} /></td>
                            <td className="px-5 py-3.5"><GatewayBadge gateway={o.gateway} /></td>
                            <td className="px-5 py-3.5 text-gray-800 text-xs whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                          </motion.tr>
                        ))}
                      </DataTable>
                    )
                  })()}
                </motion.div>
              )}

              {/* ── MESSAGES / CONTACTS ──────────────────── */}
              {activeTab === 'contacts' && (
                <motion.div
                  key="contacts"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <FilterBar
                    search={search} setSearch={setSearch}
                    placeholder="Search name, email, subject, message…"
                  />

                  {(() => {
                    const rows = contacts.filter(c => {
                      const q = search.toLowerCase()
                      return !q ||
                        c.name.toLowerCase().includes(q) ||
                        c.email.toLowerCase().includes(q) ||
                        c.subject.toLowerCase().includes(q) ||
                        c.message.toLowerCase().includes(q)
                    })

                    if (rows.length === 0) {
                      return (
                        <div className="glass-card rounded-2xl border border-green-800/15 py-16 text-center text-black font-semibold text-sm">
                          No messages found
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-3">
                        {rows.map((c, i) => (
                          <motion.div
                            key={c._id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="glass-card rounded-xl border border-green-800/15 hover:border-green-600/25 transition-all duration-200"
                          >
                            <div className="flex items-start gap-4 p-5">
                              {/* Unread indicator */}
                              <div className="mt-2 flex-shrink-0">
                                <div className={`w-2 h-2 rounded-full ${c.read ? 'bg-green-800/25' : 'bg-green-400'}`} />
                              </div>
                              {/* Avatar */}
                              <div className="w-9 h-9 rounded-full border border-green-600/20 bg-green-600/8 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 text-sm font-display">{c.name[0]}</span>
                              </div>
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-1.5">
                                  <span className="font-semibold text-black text-sm">{c.name}</span>
                                  <span className="text-gray-800 text-xs">{c.email}</span>
                                  <span className="ml-auto text-gray-800 text-xs whitespace-nowrap">{fmtDate(c.createdAt)}</span>
                                </div>
                                <div className="mb-2">
                                  <span className="font-accent text-xs tracking-wider text-green-500 uppercase px-2 py-0.5 border border-green-600/15 rounded-full">
                                    {c.subject}
                                  </span>
                                </div>
                                <p className="text-black text-sm leading-relaxed line-clamp-2">{c.message}</p>
                              </div>
                              {/* Actions */}
                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => setViewContact(c)}
                                  className="text-black hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-600/8"
                                  title="View message"
                                >
                                  <Eye size={14} />
                                </motion.button>
                                <motion.a
                                  whileHover={{ scale: 1.1 }}
                                  href={`mailto:${c.email}?subject=Re: ${c.subject}`}
                                  className="text-black hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-600/8"
                                  title="Reply by email client"
                                >
                                  <Mail size={14} />
                                </motion.a>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  })()}
                </motion.div>
              )}
              {/* ── MANAGE BOOKS ────────────────────────── */}
              {activeTab === 'books' && (
                <motion.div
                  key="books"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <FilterBar
                      search={search} setSearch={setSearch}
                      placeholder="Search books by title, author, category..."
                    />
                    <button
                      onClick={() => { setEditingBook(null); setIsBookModalOpen(true); }}
                      className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 self-stretch sm:self-auto justify-center"
                      style={{ padding: '10px 18px' }}
                    >
                      <Plus size={14} className="relative z-10" />
                      <span>Add New Book</span>
                    </button>
                  </div>

                  {(() => {
                    const rows = books.filter(b => {
                      const q = search.toLowerCase()
                      return !q ||
                        b.title.toLowerCase().includes(q) ||
                        b.author.toLowerCase().includes(q) ||
                        b.category.toLowerCase().includes(q)
                    })

                    return (
                      <DataTable
                        headers={['Cover', 'Title & Author', 'Category', 'Type', 'Price', 'Actions']}
                        empty={rows.length === 0}
                      >
                        {rows.map((b, i) => (
                          <motion.tr
                            key={b._id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-green-800/8 hover:bg-green-600/4 transition-colors"
                          >
                            <td className="px-5 py-3">
                              <div className="w-10 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                {b.coverImage ? (
                                  <img 
                                    src={b.coverImage.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || ''}${b.coverImage}` : b.coverImage} 
                                    alt={b.title} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">Cover</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="font-semibold text-black text-sm">{b.title}</div>
                              <div className="text-gray-800 text-xs">by {b.author}</div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 border border-gray-200 font-medium text-gray-700">
                                {b.category}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-accent ${
                                b.type === 'ebook' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              }`}>
                                {b.type === 'ebook' ? 'E-BOOK' : 'PRINT'}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-display font-semibold text-sm text-green-600">${b.price}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setEditingBook(b); setIsBookModalOpen(true); }}
                                  className="text-black hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-600/8"
                                  title="Edit Book"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteBook(b._id)}
                                  className="text-black hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-600/8"
                                  title="Delete Book"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </DataTable>
                    )
                  })()}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Contact detail modal ─────────────────────────────── */}
      <AnimatePresence>
        {viewContact && (
          <ContactDetailModal
            contact={viewContact}
            onClose={() => setViewContact(null)}
            onReplySuccess={(updatedContact) => {
              setContacts(prev => prev.map(c => c._id === updatedContact._id ? updatedContact : c))
              setViewContact(updatedContact)
            }}
            token={admin?.token}
          />
        )}
      </AnimatePresence>

      {/* ── Book edit/create modal ───────────────────────────── */}
      <AnimatePresence>
        {isBookModalOpen && (
          <BookModal
            book={editingBook}
            onClose={() => setIsBookModalOpen(false)}
            onSaveSuccess={() => {
              setIsBookModalOpen(false)
              fetchData()
            }}
            token={admin?.token}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
