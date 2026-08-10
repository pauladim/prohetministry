import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Quote, Star } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import ScrollReveal from '../components/ui/ScrollReveal'

const testimonials = [
  {
    quote: "Prophet Desmond Obi prophetic word changed the entire course of my family's life. We witnessed a miraculous restoration that left us in awe of God's power.",
    name: "Grace Mensah",
    title: "Business Owner, Accra"
  },
  {
    quote: "His book 'Portals of Heaven' opened my spiritual eyes. I have never experienced such depth of revelation from any other ministry resource.",
    name: "David Asante",
    title: "Pastor, Lagos"
  },
  {
    quote: "The accuracy of the prophetic word I received at the conference was undeniable. Prophet Emmanuel carries a rare and genuine anointing.",
    name: "Abena Ofosu",
    title: "Medical Doctor, London"
  },
]

const stats = [
  { number: '19+', label: 'Years of Ministry' },
  { number: '50K+', label: 'Lives Transformed' },
  { number: '15+', label: 'Nations Reached' },
  { number: '5', label: 'Books Published' },
]

export default function Home() {
  return (
    <PageWrapper>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(29,110,77,0.12),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_50%,rgba(29,110,77,0.06),transparent)] pointer-events-none" />

        {/* Decorative lines */}
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-200/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center py-20">
          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="ornament mb-8"
            >
              <span className="font-accent text-xs tracking-[0.4em] text-green-600 uppercase">Welcome to the Ministry</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-display text-5xl md:text-7xl leading-none mb-6"
            >
              <span className="block text-gray-900">Walking in</span>
              <span className="block green-text italic">Divine Revelation</span>
              <span className="block text-gray-900">& Power</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-700 text-lg leading-relaxed mb-10 max-w-lg font-light"
            >
              Prophet Desmond Obi carries a prophetic mantle commissioned to unlock heavenly portals, restore destinies, and awaken this generation to their divine purpose.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/books" className="btn-primary">
                <span>Explore Books</span>
                <ArrowRight size={16} className="relative z-10" />
              </Link>
              <Link to="/contact" className="btn-outline">
                <span>Book a Session</span>
              </Link>
            </motion.div>
          </div>

          {/* Prophet Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <div className="relative mx-auto max-w-sm">
              {/* Glow */}
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-3xl scale-90" />

              {/* Image placeholder with elegant design */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-green-200">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/80 z-10" />
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #e8f5f0 100%)',
                  }}>
                  {/* Decorative cross/ornament */}
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-2 border-green-300/40 flex items-center justify-center mx-auto mb-4">
                      <div className="w-16 h-16 rounded-full border border-green-400/30 flex items-center justify-center">
                        <span className="text-green-600 text-3xl font-display">✦</span>
                      </div>
                    </div>
                    {/* <p className="font-accent text-green-500/60 text-xs tracking-widest uppercase">Prophet's Image</p>
                    <p className="text-gray-600 text-xs mt-1 font-body">Replace with actual photo</p> */}
                    <img src="brownpdo.jpeg" alt="" />
                  </div>
                </div>

                {/* Bottom info card */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
                  <div className="font-accent text-xs tracking-[0.3em] text-green-600 uppercase mb-1">Prophet</div>
                  <div className="font-display text-2xl text-gray-900">Desmond Obi</div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-6 top-1/3 glass-card rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-green-600 fill-green-600" />
                  <span className="text-xs font-body text-gray-800">50,000+ Lives</span>
                </div>
                <p className="text-xs text-green-600 font-accent mt-1">Transformed</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          {/* <span className="font-accent text-xs tracking-[0.3em] text-green-500/60 uppercase">Scroll</span> */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-green-400/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-green-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ number, label }, i) => (
              <ScrollReveal key={label} delay={i * 0.1} className="text-center">
                <div className="font-display text-4xl md:text-5xl green-text mb-2">{number}</div>
                <div className="font-body text-xs tracking-widest text-gray-600 uppercase">{label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO SECTION */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div className="space-y-6">
                <div className="font-accent text-xs tracking-[0.4em] text-green-600 uppercase">About the Ministry</div>
                <h2 className="font-display text-4xl md:text-5xl text-gray-900 leading-tight">
                  A Voice Ordained for <span className="italic green-text">Such a Time</span>
                </h2>
                <div className="section-divider ml-0" style={{ margin: 0 }} />
                <p className="text-gray-700 leading-relaxed">
                  With over two decades of prophetic ministry spanning 30 nations, Prophet Desmond Obi has become a trusted voice in the body of Christ. His ministry is characterized by precise prophetic accuracy, deep scriptural revelation, and undeniable signs and wonders.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Through books, conferences, and personal prophetic ministry, thousands have encountered the living God and walked into their divine destiny.
                </p>
                <Link to="/about" className="btn-outline inline-flex mt-4">
                  <span>Read His Story</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="left">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Prophetic Accuracy', text: 'Known globally for detailed and precise prophetic ministry' },
                  { title: 'Biblical Teaching', text: 'Deep, revelatory exposition of God\'s word' },
                  { title: 'Healing Ministry', text: 'Documented miracles of healing and restoration' },
                  { title: 'Book Ministry', text: '12 Spirit-filled books transforming readers worldwide' },
                ].map(({ title, text }) => (
                  <motion.div
                    key={title}
                    whileHover={{ y: -4, borderColor: 'rgba(29, 110, 77, 0.4)' }}
                    className="glass-card p-5 rounded-xl transition-all duration-300"
                  >
                    <div className="w-8 h-px bg-green-600 mb-3" />
                    <h4 className="font-accent text-xs tracking-wider text-green-600 uppercase mb-2">{title}</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{text}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FEATURED BOOK CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="relative rounded-2xl overflow-hidden glass-card border border-green-700/20 p-12 text-center"
              style={{ background: 'radial-gradient(ellipse at center, rgba(201,154,22,0.08) 0%, transparent 70%)' }}>
              <div className="font-accent text-xs tracking-[0.4em] text-green-500 uppercase mb-4">New Release</div>
              <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
                <span className="italic green-text">Portals of Heaven</span>
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
                Discover the keys to accessing heavenly dimensions and walking in continuous divine encounters. This prophetic manual will transform your prayer life.
              </p>
              <Link to="/books" className="btn-primary">
                <span>Get Your Copy</span>
                <ArrowRight size={16} className="relative z-10" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <div className="font-accent text-xs tracking-[0.4em] text-green-500 uppercase mb-4">Testimonies</div>
            <h2 className="font-display text-4xl md:text-5xl text-gray-900">Lives <span className="italic green-text">Transformed</span></h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, title }, i) => (
              <ScrollReveal key={name} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="glass-card rounded-2xl p-8 h-full flex flex-col transition-all duration-300 hover:border-green-600/30"
                >
                  <Quote size={28} className="text-green-600/40 mb-4" />
                  <p className="text-gray-600 leading-relaxed italic font-display text-lg flex-1 mb-6">
                    "{quote}"
                  </p>
                  <div>
                    <div className="w-6 h-px bg-green-600 mb-3" />
                    <div className="font-body font-medium text-gray-600 text-sm">{name}</div>
                    <div className="font-body text-green-500/70 text-xs tracking-wider mt-0.5">{title}</div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(201,154,22,0.06),transparent)]" />
        <ScrollReveal className="relative">
          <h2 className="font-display text-4xl md:text-6xl text-gray-900 mb-6">
            Ready to Encounter <span className="italic green-text">the Divine intervention?</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-10">
            Connect with the ministry today. Whether through books, prayer, or a personal word  your destiny awaits.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-primary">
              <span>Connect With Us</span>
            </Link>
            <Link to="/books" className="btn-outline">
              <span>Browse Books</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </PageWrapper>
  )
}
