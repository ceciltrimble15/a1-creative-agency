import { motion } from 'framer-motion';
import { ArrowIcon, PhoneIcon } from './icons.jsx';
import { SITE } from '../lib/site.js';

export default function BookingCTA() {
  return (
    <section id="book" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] p-[1.5px]"
        >
          {/* Glow border */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-pink-gradient opacity-80 blur-[2px]" />
          <div className="relative overflow-hidden rounded-[2.4rem] bg-coal px-7 py-16 text-center sm:px-16 sm:py-20">
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pink/25 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-pink-deep/25 blur-[120px]" />

            <div className="relative">
              <span className="section-eyebrow">Your Chair Is Waiting</span>
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Ready To Book Your <span className="pink-text">Next Look?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-silver-dim">
                Reserve your appointment and let TRHUE Hair Care deliver beauty,
                care, and confidence — tailored entirely to you.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="#contact" className="btn-primary w-full sm:w-auto">
                  Book Appointment <ArrowIcon className="h-4 w-4" />
                </a>
                <a href={SITE.phoneTel} className="btn-ghost w-full sm:w-auto">
                  <PhoneIcon className="h-4 w-4" /> Call / Text Now
                </a>
              </div>

              <p className="mt-8 text-xs uppercase tracking-[0.3em] text-silver-dim">
                Appointments available by request.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
