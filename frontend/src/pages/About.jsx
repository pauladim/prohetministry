import { motion } from 'framer-motion'
import PageWrapper from '../components/ui/PageWrapper'
import ScrollReveal from '../components/ui/ScrollReveal'

export default function About() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(16,185,129,0.05),transparent)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-accent text-xs tracking-[0.4em] text-green-500 uppercase mb-4">The Prophet</div>
            <h1 className="font-display text-5xl md:text-7xl text-gray-900 mb-6">
              His Story, His <span className="italic green-text">Call</span>
            </h1>
            <div className="section-divider" />
          </motion.div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Image */}
            <ScrollReveal>
              <div className="sticky top-28">
                <div className="relative rounded-2xl overflow-hidden border border-green-700/25 bg-white">
                  <img 
                    src="pdosuit.jpeg" 
                    alt="Prophet Desmond Obi" 
                    className="w-full h-auto block" 
                  />
                  <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>

                {/* Quote card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-card rounded-xl p-6 mt-6 border border-green-700/20"
                >
                  <p className="font-display text-xl italic text-gray-800 leading-relaxed mb-3">
                    "I did not choose this calling this calling chose me before the foundations of the world."
                  </p>
                  <div className="font-accent text-xs tracking-wider text-green-400">— Prophet Desmond Obi</div>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Text */}
            <div className="space-y-10">
              <ScrollReveal>
                <div>
                  <h2 className="font-display text-3xl text-gray-900 mb-5">Early Life & The Divine Call</h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>Born in Lagos, Nigeria, Prophet Desmond Obi was raised in a deeply devout Christian household. From a young age, he exhibited an unusual sensitivity to the spiritual realm, frequently receiving visions and dreams that would come to pass with remarkable accuracy.</p>
                    <p>At the age of 15, he had a defining encounter with the Holy Spirit during a night of prayer. In that moment, he heard a clear commission: <em className="text-gray-800 font-display">"Go and tell this generation of My love and power."</em> This encounter marked the beginning of a ministry journey that would span continents.</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div>
                  <div className="w-12 h-px bg-green-600 mb-6" />
                  <h2 className="font-display text-3xl text-gray-900 mb-5">Ministry Journey</h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>Prophet Desmond Obi studied Theology at the University of Nigeria and later received advanced prophetic training under some of Africa's most respected apostolic voices. He founded Desmond Obi Prophetic Ministries in 2011, which has since grown into a global movement.</p>
                    <p>His ministry has taken him to over 30 nations across Africa, Europe, North America, and the Caribbean. At every crusade and conference, documented miracles of healing, restoration, and prophetic revelation have followed his ministry.</p>
                    <p>He is the author of 12 published books, many of which have become required reading in Bible schools across the continent. His writings carry a distinctive anointing that ministers directly to the spirit of the reader.</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="grid grid-cols-3 gap-4 py-8 border-y border-green-800/20">
                  {[['2015', 'Ministry Founded'], ['30+', 'Nations'], ['5', 'Books']].map(([num, label]) => (
                    <div key={label} className="text-center">
                      <div className="font-display text-3xl green-text">{num}</div>
                      <div className="text-gray-500 text-xs font-body tracking-wider mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                {/* <div>
                  <div className="w-12 h-px bg-green-600 mb-6" />
                  <h2 className="font-display text-3xl text-gray-900 mb-5">Family Life</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Prophet Desmond is married to Prophetes, his faithful ministry partner for over 20 years. Together they have three children who are all actively serving in ministry. The family resides in Accra, Ghana, from where they coordinate the global ministry operations.
                  </p>
                </div> */}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6 bg-gray-50 border-y border-green-800/15">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <div className="font-accent text-xs tracking-[0.4em] text-green-500 uppercase mb-4">Our Foundation</div>
            <h2 className="font-display text-4xl md:text-5xl text-gray-900">Mission & <span className="italic green-text">Vision</span></h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                label: 'Mission',
                title: 'Raising a Prophetic Generation',
                text: 'Our mission is to awaken the prophetic consciousness of the body of Christ globally training, equipping, and releasing believers to walk in their divine calling with accuracy, integrity, and supernatural power. Every soul transformed is a testament to God\'s faithfulness.',
                icon: '✦'
              },
              {
                label: 'Vision',
                title: 'A World Encountering the Living God',
                text: 'We envision a global revival where the church returns to the authentic, power-filled Christianity of the first century. Through prophetic ministry, literature, and training centres across every continent, we believe a generation will arise who will demonstrate the Kingdom of God in undeniable ways.',
                icon: '◈'
              }
            ].map(({ label, title, text, icon }) => (
              <ScrollReveal key={label}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="glass-card rounded-2xl p-10 h-full border border-green-800/20 hover:border-green-600/30 transition-all duration-300"
                >
                  <div className="text-green-500 text-3xl mb-4">{icon}</div>
                  <div className="font-accent text-xs tracking-[0.3em] text-green-500 uppercase mb-3">{label}</div>
                  <h3 className="font-display text-2xl text-gray-900 mb-5">{title}</h3>
                  <p className="text-gray-700 leading-relaxed">{text}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <div className="font-accent text-xs tracking-[0.4em] text-green-500 uppercase mb-4">What We Stand For</div>
            <h2 className="font-display text-4xl text-gray-900">Core <span className="italic green-text">Values</span></h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: 'Integrity', desc: 'Transparency and honesty in all ministry operations' },
              { value: 'Accuracy', desc: 'Every prophetic word tested against Scripture' },
              { value: 'Humility', desc: 'Servanthood as the foundation of all leadership' },
              { value: 'Excellence', desc: 'Giving God the very best in everything we do' },
            ].map(({ value, desc }, i) => (
              <ScrollReveal key={value} delay={i * 0.1}>
                <div className="text-center p-6 rounded-xl border border-green-800/15 hover:border-green-600/25 transition-colors">
                  <div className="w-10 h-10 rounded-full border border-green-600/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-400 text-xs font-accent">{(i + 1).toString().padStart(2, '0')}</span>
                  </div>
                  <h4 className="font-display text-xl text-gray-900 mb-2">{value}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
