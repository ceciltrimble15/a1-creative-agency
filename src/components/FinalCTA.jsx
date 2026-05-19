import { motion } from 'framer-motion';
import { ArrowIcon, PhoneIcon } from './icons.jsx';
import { SITE } from '../lib/site.js';

export default function FinalCTA() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] border border-pink/25 bg-gradient-to-b from-pink/[0.08] to-transparent px-6 py-14 text-center sm:px-12 sm:py-20"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-pink/25 blur-[120px]" />

          <div className="relative">
            <span className="section-eyebrow">The TRHUE Experience</span>
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              Ready To Elevate <span className="pink-text">Your Look?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-silver-dim sm:text-base">
              Professional beauty care designed around confidence, consistency,
              and presentation.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
              <a href="#contact" className="btn-primary w-full sm:w-auto">
                Book Appointment <ArrowIcon className="h-4 w-4" />
              </a>
              <a href={SITE.phoneTel} className="btn-ghost w-full sm:w-auto">
                <PhoneIcon className="h-4 w-4" /> Call / Text Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
