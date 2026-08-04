import { motion } from 'framer-motion'
import PageWrapper from '../components/ui/PageWrapper'
import ScrollReveal from '../components/ui/ScrollReveal'

const sermonVideos = [
  { id: '3Qk1aXxmIFw', title: '' },
  { id: 'QJSstc2AxQE', title: '' },
  { id: 'LuvG-342ik8', title: '' },
  { id: 'BEvdGgBRyNo', title: '' },
  { id: 'UjKADOqV5P0', title: '' },
  { id: 'N5kDLouT5lE', title: '' },
]

export default function Sermons() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="font-display text-4xl md:text-5xl text-gray-900 mb-6">
                Sermons
              </h1>
              <p className="text-xl text-green-600 max-w-2xl mx-auto">
                Watch and be inspired by powerful messages from Prophet Desmond Obi
              </p>
            </motion.div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sermonVideos.map((video, index) => (
              <ScrollReveal key={video.id} delay={index * 0.1}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/50 backdrop-blur-sm border border-green-200 rounded-lg overflow-hidden hover:border-green-400 transition-all duration-300"
                >
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{video.title}</h3>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-12"
            >
              <a
                href="https://www.youtube.com/@ProphetDesmondObi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300"
              >
                View more on YouTube
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </PageWrapper>
  )
}

