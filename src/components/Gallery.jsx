import { motion } from 'framer-motion';

const looks = [
  { label: 'Silk Press', tone: 'from-pink/40 via-pink-deep/20 to-transparent', tall: true },
  { label: 'Full Wig Install', tone: 'from-fuchsia-500/30 via-pink/15 to-transparent' },
  { label: 'Sleek Styling', tone: 'from-pink-soft/30 via-pink/10 to-transparent' },
  { label: 'Bridal Glam', tone: 'from-pink/35 via-pink-deep/15 to-transparent', tall: true },
  { label: 'Color & Care', tone: 'from-rose-500/30 via-pink/15 to-transparent' },
  { label: 'Protective Style', tone: 'from-pink/30 via-fuchsia-600/15 to-transparent' },
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-80 w-80 rounded-full bg-pink/10 blur-[140px]" />
      <div className="container-x relative">
        <div className="mb-16 max-w-2xl">
          <span className="section-eyebrow">The Portfolio</span>
          <h2 className="section-title text-white">
            Client Looks &amp; <span className="pink-text">Results</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-silver-dim">
            A showcase of finishes, transformations, and signature styles —
            every look crafted with precision and care.
          </p>
        </div>

        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {looks.map((look, i) => (
            <motion.figure
              key={look.label}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-graphite ${
                look.tall ? 'row-span-2' : ''
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${look.tone} transition-transform duration-700 group-hover:scale-110`}
              />
              <div className="absolute inset-0 grain opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />

              <div className="absolute right-5 top-5 h-9 w-9 rounded-full border border-white/15 bg-white/5 backdrop-blur-md transition-all duration-500 group-hover:border-pink/60 group-hover:bg-pink/20" />

              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-pink-soft">
                    TRHUE
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-white">
                    {look.label}
                  </p>
                </div>
                <span className="translate-y-2 text-xs font-medium uppercase tracking-[0.2em] text-silver-dim opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  View
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-silver-dim">
          Placeholder showcase — ready for real client photography
        </p>
      </div>
    </section>
  );
}
