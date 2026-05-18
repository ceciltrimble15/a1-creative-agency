import { motion } from 'framer-motion';

/* Decorative placeholder QR — swap with the real booking QR image when ready. */
function QRPlaceholder() {
  const cells = [];
  const seed = [
    0x7f, 0x41, 0x5d, 0x5d, 0x41, 0x7f, 0x00, 0x2b, 0x6e, 0x1c, 0x4a, 0x33,
    0x55, 0x2a, 0x7c, 0x13, 0x68, 0x4f, 0x21, 0x5a, 0x36, 0x6d, 0x1b, 0x47,
  ];
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      if ((seed[(r + c) % seed.length] >> (c % 7)) & 1) {
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />);
      }
    }
  }
  const Finder = ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" rx="1" fill="#fff" />
      <rect x="1" y="1" width="5" height="5" rx="0.6" fill="#050505" />
      <rect x="2" y="2" width="3" height="3" rx="0.4" fill="#ff2e88" />
    </g>
  );
  return (
    <svg viewBox="0 0 21 21" className="h-full w-full" shapeRendering="crispEdges">
      <rect width="21" height="21" fill="#fff" />
      <g fill="#0a0a0c">{cells}</g>
      <Finder x={0} y={0} />
      <Finder x={14} y={0} />
      <Finder x={0} y={14} />
    </svg>
  );
}

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
          <div className="pointer-events-none absolute -left-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-pink/15 blur-[110px]" />

          <div className="relative shrink-0">
            <div className="absolute -inset-3 rounded-[1.75rem] bg-pink-gradient opacity-60 blur-md" />
            <div className="relative h-52 w-52 overflow-hidden rounded-[1.5rem] border border-white/15 bg-white p-3 shadow-glow-lg sm:h-60 sm:w-60">
              <QRPlaceholder />
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-silver-dim">
              Placeholder code
            </p>
          </div>

          <div className="relative">
            <span className="section-eyebrow">QR-Ready Business Setup</span>
            <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
              Scan To <span className="pink-text">Book</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-silver-dim lg:mx-0">
              Scan the TRHUE Hair Care booking code to request services,
              appointments, or information — perfect for business cards, salon
              signage, mirrors, and social media.
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
