import { motion } from 'framer-motion';
import { ArrowIcon } from './icons.jsx';

const offerings = [
  {
    title: 'Premium Hair Bundles',
    desc: 'Quality bundles selected for natural movement, longevity, and a flawless install.',
  },
  {
    title: 'Healthy Hair Oils',
    desc: 'Nourishing oils that support scalp health, strength, and lasting shine.',
  },
  {
    title: 'Beauty Maintenance',
    desc: 'Salon-grade essentials to protect and maintain your look between visits.',
  },
  {
    title: 'Extensions & Installs',
    desc: 'Custom extensions and protective installs tailored to your texture and goals.',
  },
  {
    title: 'Custom Consultations',
    desc: 'Personalized beauty recommendations built around your hair and lifestyle.',
  },
];

const card = {
  hidden: { opacity: 0, y: 26 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Collection() {
  return (
    <section id="collection" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-pink/10 blur-[140px]" />
      <div className="container-x relative">
        <div className="mb-14 max-w-2xl">
          <span className="section-eyebrow">The Boutique</span>
          <h2 className="section-title text-white">
            Pretty Hair Care <span className="pink-text">Collection</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-silver-dim">
            Bundles, oils, and beauty products available by inquiry — a curated
            luxury collection for healthy hair and lasting confidence.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((o, i) => (
            <motion.article
              key={o.title}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="group relative overflow-hidden rounded-3xl glass p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-pink/40 hover:shadow-card"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-pink/0 blur-3xl transition-all duration-500 group-hover:bg-pink/20" />
              <div className="relative h-1 w-12 rounded-full bg-pink-gradient" />
              <h3 className="relative mt-6 font-display text-2xl font-bold text-white">
                {o.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-silver-dim">
                {o.desc}
              </p>
            </motion.article>
          ))}

          <motion.div
            custom={offerings.length}
            variants={card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-pink/25 bg-gradient-to-br from-pink/[0.10] to-transparent p-8"
          >
            <div>
              <p className="font-display text-xl font-bold text-white">
                Available By Inquiry
              </p>
              <p className="mt-3 text-sm leading-relaxed text-silver-dim">
                Contact us for bundle availability, healthy hair products,
                custom installs, and personalized beauty recommendations.
              </p>
            </div>
            <a href="#contact" className="btn-primary mt-7 inline-flex w-full">
              Inquire Now <ArrowIcon className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
