/**
 * Central book catalog.
 * Keep this in sync with backend/routes/payments.js BOOKS object.
 */
export const BOOKS = [
  // ── E-Books ──────────────────────────────────────────────────────────────
  {
    _id: 'ebook-1',
    title: 'Portals of Heaven',
    subtitle: 'Accessing Heavenly Dimensions',
    description:
      'Discover the spiritual keys to opening heavenly portals in your life. A prophetic manual that will transform your prayer life and deepen your encounter with God.',
    price: 15,
    type: 'ebook',
    pages: 240,
    tag: 'Bestseller',
    category: 'Prophetic',
  },
  {
    _id: 'ebook-2',
    title: "The Seer's Mantle",
    subtitle: 'Understanding Prophetic Vision',
    description:
      "A comprehensive guide to developing and stewarding prophetic sight. Learn to interpret visions, dreams, and spiritual encounters with biblical accuracy.",
    price: 18,
    type: 'ebook',
    pages: 198,
    tag: 'New Release',
    category: 'Prophetic',
  },
  {
    _id: 'ebook-3',
    title: 'Covenant Prayers',
    subtitle: '40 Days of Prophetic Intercession',
    description:
      "A powerful 40-day journey of prophetic prayer and intercession. Each day unlocks new dimensions of God's covenant promises over your life.",
    price: 12,
    type: 'ebook',
    pages: 160,
    tag: null,
    category: 'Prayer',
  },

  // ── Physical Books ────────────────────────────────────────────────────────
  {
    _id: 'phys-1',
    title: 'Voices of Destiny',
    subtitle: 'Discovering Your Prophetic Purpose',
    description:
      "A landmark work on understanding and walking in your God-ordained destiny. Beautifully designed hardcover edition with study guides and reflection questions.",
    price: 35,
    type: 'physical',
    pages: 310,
    tag: 'Hardcover',
    category: 'Destiny',
  },
  {
    _id: 'phys-2',
    title: 'Fire & Glory',
    subtitle: 'Revival Prayers for Africa',
    description:
      "A prophetic prayer manual specifically written for the African continent. Contains powerful territorial warfare prayers, declarations, and revival strategies.",
    price: 28,
    type: 'physical',
    pages: 280,
    tag: null,
    category: 'Revival',
  },
  {
    _id: 'phys-3',
    title: 'The Prophetic Anointing',
    subtitle: 'Training Manual for Ministers',
    description:
      "Used in Bible schools across Africa, this comprehensive training manual equips ministers to operate in the prophetic office with integrity and power.",
    price: 32,
    type: 'physical',
    pages: 350,
    tag: 'Ministry Resource',
    category: 'Ministry',
  },
]

export const getEbooks   = () => BOOKS.filter(b => b.type === 'ebook')
export const getPhysical = () => BOOKS.filter(b => b.type === 'physical')
export const getById     = (id) => BOOKS.find(b => b._id === id)
