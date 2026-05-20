import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
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
          {/* Soft pink swoosh accents framing the QR card */}
          <div className="pointer-events-none absolute -left-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-pink/[0.13] blur-[110px]" />
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-pink-deep/[0.10] blur-[110px]" />

          <div className="relative shrink-0">
            {/* Sparkle accents */}
            <span className="pointer-events-none absolute -left-3 -top-3 h-2 w-2 rounded-full bg-pink-soft/80 shadow-glow" />
            <span className="pointer-events-none absolute -right-2 top-6 h-1.5 w-1.5 rounded-full bg-pink/80" />
            <span className="pointer-events-none absolute -bottom-2 -left-1 h-1.5 w-1.5 rounded-full bg-pink/70" />
            <span className="pointer-events-none absolute -bottom-3 right-4 h-2 w-2 rounded-full bg-pink-soft/80 shadow-glow" />

            {/* Branded pink frame around the QR */}
            <div className="absolute -inset-3 rounded-[1.75rem] bg-pink-gradient opacity-[0.55] blur-md" />
            <div className="relative h-52 w-52 overflow-hidden rounded-[1.5rem] border border-white/15 bg-white p-3 shadow-glow sm:h-60 sm:w-60">
              <QRCodeSVG
                value={SITE.url}
                title={`Scan to book ${SITE.name}`}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
                marginSize={0}
                className="h-full w-full"
                imageSettings={{
                  src: '/trhue-logo.png',
                  height: 44,
                  width: 44,
                  excavate: true,
                }}
              />
            </div>
            <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-pink-soft">
              Linked to: trhuehaircare.com
            </p>
          </div>

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
