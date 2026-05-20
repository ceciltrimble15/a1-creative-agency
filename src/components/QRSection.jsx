import { motion } from 'framer-motion';
import { SITE } from '../lib/site.js';

export default function QRSection() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto flex max-w-4xl flex-col items-center gap-10 overflow-hidden rounded-[2.25rem] glass p-9 text-center sm:p-14 lg:flex-row lg:text-left"
        >
          {/* Soft pink halos framing the scan card */}
          <div className="pointer-events-none absolute -left-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-pink/[0.13] blur-[110px]" />
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-pink-deep/[0.10] blur-[110px]" />

          <a
            href={SITE.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${SITE.name} booking page`}
            className="relative block shrink-0"
          >
            {/* Soft pink halo behind the printed scan card */}
            <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-pink-gradient opacity-40 blur-xl" />
            <div className="relative w-64 overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink shadow-glow-lg transition-transform duration-500 hover:-translate-y-1 sm:w-72">
              <img
                src="/qr-trhue.png"
                alt={`Scan to book ${SITE.name} — links to ${SITE.url}`}
                width="960"
                height="1200"
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </div>
          </a>

          <div className="relative">
            <span className="section-eyebrow">QR-Ready Business Setup</span>
            <h2 className="font-display text-4xl font-bold uppercase tracking-[0.04em] text-white sm:text-5xl">
              Scan To <span className="pink-text">Book</span>
            </h2>
            <p className="mt-3 font-display text-xl font-semibold text-pink-soft">
              {SITE.name}
            </p>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-silver-dim lg:mx-0">
              Scan to view services, pricing, booking info, bundles, and contact
              details.
            </p>
            <a href="#contact" className="btn-primary mt-8 inline-flex">
              Or Book Online
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
