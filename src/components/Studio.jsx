import { motion } from 'framer-motion';

const details = [
  { src: '/studio/studio-stations.jpg', label: 'Styling Stations' },
  { src: '/studio/studio-amenities.jpg', label: 'Premium Amenities' },
];

export default function Studio() {
  return (
    <section id="studio" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-pink/10 blur-[140px]" />
      <div className="pointer-events-none absolute left-0 bottom-1/4 h-72 w-72 rounded-full bg-pink-deep/[0.08] blur-[140px]" />

      <div className="container-x relative">
        <div className="mb-12 max-w-2xl">
          <span className="section-eyebrow">Inside The Studio</span>
          <h2 className="section-title text-white">
            A Modern <span className="pink-text">Luxury</span> Salon
          </h2>
          <p className="mt-5 text-base leading-relaxed text-silver-dim">
            Step into a space built for craft, comfort, and confidence —
            polished finishes, premium chairs, and a luxury environment
            designed to make every appointment feel like an experience.
          </p>
        </div>

        {/* Cinematic banner */}
        <motion.figure
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 shadow-card"
        >
          <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-pink-gradient opacity-20 blur-2xl" />
          <img
            src="/studio/studio-banner.jpg"
            alt="Inside the TRHUE Hair Care studio — luxury salon floor"
            width="1600"
            height="685"
            loading="lazy"
            decoding="async"
            className="relative h-auto w-full"
          />
          {/* legibility gradient for the on-image caption */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
          <figcaption className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-pink-soft">
              TRHUE Studio
            </p>
            <p className="mt-1 font-display text-lg font-bold text-white sm:text-2xl">
              Cincinnati · Glenway Ave
            </p>
          </figcaption>
        </motion.figure>

        {/* 2-up detail grid */}
        <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2">
          {details.map((d, i) => (
            <motion.figure
              key={d.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-graphite shadow-card transition-all duration-500 hover:border-pink/40 hover:shadow-glow"
            >
              <img
                src={d.src}
                alt={`TRHUE Hair Care studio — ${d.label}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
              <figcaption className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-pink-soft">
                  TRHUE
                </p>
                <p className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
                  {d.label}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
