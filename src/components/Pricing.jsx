import { motion } from 'framer-motion';
import { ArrowIcon } from './icons.jsx';

const prices = [
  { name: 'Silk Press', price: '$65+', note: 'Healthy, glossy, frizz-free finish' },
  { name: 'Roll & Set', price: '$55', note: 'Classic volume, curl & bounce' },
  { name: 'Ponytail', price: '$60+', note: 'Sleek, polished & secure' },
  { name: 'Quick Weave', price: '$70', note: 'Fast, flawless protective look' },
  { name: 'Sew-In', price: '$100', note: 'Natural, long-wear protective style' },
  { name: 'Short Style Curl', price: '$50', note: 'Defined, shaped & elegant' },
  { name: 'Color', price: '$30+', note: 'Custom tones & dimension' },
];

const row = {
  hidden: { opacity: 0, y: 22 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-1/4 h-72 w-72 rounded-full bg-pink/10 blur-[130px]" />
      <div className="container-x relative">
        <div className="mb-14 max-w-2xl">
          <span className="section-eyebrow">Services &amp; Pricing</span>
          <h2 className="section-title text-white">
            The <span className="pink-text">Service Menu</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-silver-dim">
            Professional styling and healthy hair care — refined, consistent,
            and crafted around you every visit.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-3.5 sm:gap-4">
          {prices.map((p, i) => (
            <motion.div
              key={p.name}
              custom={i}
              variants={row}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              className="group flex items-center justify-between gap-5 rounded-2xl glass px-6 py-5 transition-all duration-400 hover:-translate-y-0.5 hover:border-pink/40 hover:shadow-card sm:px-8 sm:py-6"
            >
              <div>
                <p className="font-display text-lg font-bold text-white sm:text-xl">
                  {p.name}
                </p>
                <p className="mt-1 text-xs text-silver-dim sm:text-sm">
                  {p.note}
                </p>
              </div>
              <span className="flex-none font-display text-xl font-bold text-pink-soft transition-colors duration-300 group-hover:text-white sm:text-2xl">
                {p.price}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-silver-dim/80 sm:text-sm">
          Final pricing may vary depending on hair length, condition,
          customization, and desired style.
        </p>

        <div className="mt-10 flex justify-center">
          <a href="#contact" className="btn-primary">
            Book Appointment <ArrowIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
