import { motion } from 'framer-motion';

export default function RealClientResults() {
  return (
    <section className="relative pb-2 pt-16 sm:pb-4 sm:pt-24">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="section-eyebrow">Real Client Results</span>
          <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Real clients. <span className="pink-text">Real confidence.</span> Real
            results.
          </h2>
          <div className="mx-auto mt-7 h-px w-40 bg-gradient-to-r from-transparent via-pink to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
