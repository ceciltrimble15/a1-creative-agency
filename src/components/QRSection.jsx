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
          {/* Outer pink glow — intensity reduced ~15% for cleaner scanning */}
          <div className="pointer-events-none absolute -left-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-pink/[0.13] blur-[110px]" />

          <div className="relative shrink-0">
            <div className="absolute -inset-3 rounded-[1.75rem] bg-pink-gradient opacity-[0.51] blur-md" />
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
