import { motion } from 'framer-motion';

const looks = [
  {
    src: '/portfolio/silk-press.jpg',
    label: 'Curled Silk Press',
    tag: 'Silk Press',
    pos: 'center 30%',
  },
  {
    src: '/portfolio/sleek-ponytail.jpg',
    label: 'Sleek Ponytail',
    tag: 'Sleek Styling',
    pos: 'center 35%',
  },
  {
    src: '/portfolio/pixie-curls.jpg',
    label: 'Pixie Curl Style',
    tag: 'Short Styling',
    pos: 'center 28%',
  },
  {
    src: '/portfolio/soft-curls.jpg',
    label: 'Long Soft Curls',
    tag: 'Soft Curl Finish',
    pos: 'center 25%',
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="pointer-events-none absolute left-0 top-1/3 h-80 w-80 rounded-full bg-pink/10 blur-[140px]" />
      <div className="container-x relative">
        <div className="mb-12 max-w-2xl sm:mb-14">
          <span className="section-eyebrow">The Portfolio</span>
          <h2 className="section-title text-white">
            Client Looks &amp; <span className="pink-text">Results</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-silver-dim sm:text-base">
            Real finishes from the chair — silk press, sleek styling, pixie
            curls, and soft curl results, crafted with precision and care.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {looks.map((look, i) => (
            <motion.figure
              key={look.src}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-graphite shadow-[0_20px_50px_-25px_rgba(0,0,0,0.9)]"
            >
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img
                  src={look.src}
                  alt={`TRHUE Hair Care — ${look.label}`}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  style={{ objectPosition: look.pos }}
                  className="h-full w-full select-none object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5 transition-all duration-500 group-hover:ring-pink/40" />

              <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-pink-soft">
                  {look.tag}
                </p>
                <p className="mt-1.5 font-display text-lg font-bold text-white sm:text-xl">
                  {look.label}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
