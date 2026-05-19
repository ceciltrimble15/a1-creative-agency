import { motion } from 'framer-motion';

const items = [
  'Cincinnati-Based',
  'Appointment Requests Available',
  'Natural Hair Care',
  'Professional Styling',
  'Community-Focused Beauty Brand',
];

export default function TrustStrip() {
  return (
    <section className="relative -mt-6 border-y border-white/10 bg-white/[0.02] backdrop-blur-sm sm:-mt-2">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 sm:gap-x-12 sm:py-6"
      >
        {items.map((label) => (
          <div
            key={label}
            className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-silver-dim sm:text-xs sm:tracking-[0.26em]"
          >
            <span className="h-1.5 w-1.5 flex-none rounded-full bg-pink shadow-glow" />
            {label}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
