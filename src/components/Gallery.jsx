import { motion } from 'framer-motion';

const looks = [
  {
    label: 'Silk Press',
    src: '/gallery/silk-press.jpg',
    tone: 'from-pink/40 via-pink-deep/20 to-transparent',
    position: 'object-top',
  },
  {
    label: 'Sleek Ponytail',
    src: '/gallery/sleek-ponytail.jpg',
    tone: 'from-fuchsia-500/30 via-pink/15 to-transparent',
    position: 'object-center',
  },
  {
    label: 'Pixie Curl Style',
    src: '/gallery/pixie-curl-style.jpg',
    tone: 'from-pink-soft/30 via-pink/10 to-transparent',
    position: 'object-center',
  },
  {
    label: 'Long Soft Curls',
    src: '/gallery/long-soft-curls.jpg',
    tone: 'from-pink/35 via-pink-deep/15 to-transparent',
    position: 'object-center',
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-80 w-80 rounded-full bg-pink/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-72 w-72 rounded-full bg-pink-deep/10 blur-[140px]" />

      <div className="container-x relative">
        <div className="mb-16 max-w-2xl">
          <span className="section-eyebrow">The Portfolio</span>
          <h2 className="section-title text-white">
            Real Client Work &amp; <span className="pink-text">Signature Finishes</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-silver-dim">
            A showcase of finishes, transformations, and signature styles —
            every look crafted with precision and care.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {looks.map((look, i) => (
            <motion.figure
              key={look.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10 bg-graphite shadow-card transition-all duration-500 hover:border-pink/50 hover:shadow-glow"
            >
              {/* Tonal fallback (always rendered — keeps the card elegant if photo fails to load) */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${look.tone}`}
                aria-hidden="true"
              />

              {/* Real client photo */}
              <img
                src={look.src}
                alt={`TRHUE Hair Care — ${look.label}`}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover ${look.position} transition-transform duration-700 ease-out group-hover:scale-[1.04]`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              {/* Subtle film grain over photo */}
              <div className="pointer-events-none absolute inset-0 grain opacity-30" />

              {/* Bottom gradient for legible caption over any photo */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/95 via-ink/55 to-transparent" />

              {/* Top-right luxury chip */}
              <div className="absolute right-4 top-4 h-9 w-9 rounded-full border border-white/15 bg-black/30 backdrop-blur-md transition-all duration-500 group-hover:border-pink/70 group-hover:bg-pink/25" />

              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-pink-soft">
                    TRHUE
                  </p>
                  <p className="mt-1 font-display text-xl font-bold leading-tight text-white">
                    {look.label}
                  </p>
                </div>
                <span className="translate-y-2 text-[10px] font-medium uppercase tracking-[0.22em] text-silver-dim opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  Book →
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <p className="mt-12 text-center text-xs uppercase tracking-[0.3em] text-silver-dim">
          Real Client Work · Book Your Transformation
        </p>
      </div>
    </section>
  );
}
