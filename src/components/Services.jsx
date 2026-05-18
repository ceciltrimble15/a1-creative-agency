import { motion } from 'framer-motion';
import {
  SilkPressIcon,
  WigIcon,
  CareIcon,
  StylingIcon,
  TreatmentIcon,
  CollectionIcon,
} from './icons.jsx';

const services = [
  {
    icon: SilkPressIcon,
    title: 'Silk Press',
    desc: 'Smooth, glossy, frizz-free finishes that move naturally and last — without compromising your hair’s health.',
  },
  {
    icon: WigIcon,
    title: 'Wig Install',
    desc: 'Seamless, natural-looking installs with a flawless hairline and a secure, confident, all-day fit.',
  },
  {
    icon: CareIcon,
    title: 'Hair Care',
    desc: 'Personalized care routines and consultations focused on long-term strength, growth, and shine.',
  },
  {
    icon: StylingIcon,
    title: 'Styling',
    desc: 'Event-ready and everyday styling crafted around your features, your texture, and your moment.',
  },
  {
    icon: TreatmentIcon,
    title: 'Treatments',
    desc: 'Deep-conditioning and restorative treatments that repair, hydrate, and protect every strand.',
  },
  {
    icon: CollectionIcon,
    title: 'Pretty Hair Care Collection',
    desc: 'Our signature product line — salon-grade essentials to maintain your look between visits.',
  },
];

const card = {
  hidden: { opacity: 0, y: 30 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Services() {
  return (
    <section id="services" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-pink/10 blur-[130px]" />
      <div className="container-x relative">
        <div className="mb-16 max-w-2xl">
          <span className="section-eyebrow">What We Offer</span>
          <h2 className="section-title text-white">
            Services Built Around <span className="pink-text">You</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-silver-dim">
            Luxury hair care and beauty services built around confidence,
            consistency, and presentation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.article
                key={s.title}
                custom={i}
                variants={card}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="group relative overflow-hidden rounded-3xl glass p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-pink/40 hover:shadow-card"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-pink/0 blur-3xl transition-all duration-500 group-hover:bg-pink/25" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-pink/30 bg-pink/10 text-pink-soft transition-all duration-500 group-hover:scale-110 group-hover:text-white group-hover:shadow-glow">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="relative mt-6 font-display text-2xl font-bold text-white">
                  {s.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-silver-dim">
                  {s.desc}
                </p>
                <div className="relative mt-6 h-px w-full bg-gradient-to-r from-pink/40 via-pink/10 to-transparent" />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
