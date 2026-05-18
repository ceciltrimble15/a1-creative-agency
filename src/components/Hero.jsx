import { motion } from 'framer-motion';
import Logo from './Logo.jsx';
import { ArrowIcon, MapPinIcon } from './icons.jsx';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-28 pb-24"
    >
      {/* Floating glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-pink/25 blur-[120px] animate-float" />
        <div className="absolute right-[-6rem] top-1/3 h-96 w-96 rounded-full bg-pink-deep/20 blur-[140px] animate-float-slow" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink/15 blur-[120px] animate-pulse-glow" />
      </div>

      {/* Faint watermark logo — desktop only, kept subtle to avoid copy collision */}
      <Logo className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[120%] max-w-[1000px] -translate-x-1/2 -translate-y-1/2 opacity-[0.035] sm:block" />

      <div className="container-x relative z-10 flex flex-col items-center text-center">
        <motion.div {...fade(0)}>
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-pink/30 bg-pink/10 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-pink-soft sm:text-[11px]">
            <MapPinIcon className="h-3.5 w-3.5" /> Cincinnati, Ohio · Premium Hair Care Studio
          </span>
        </motion.div>

        <motion.div {...fade(0.1)}>
          <Logo className="mx-auto w-[min(88vw,580px)] drop-shadow-[0_0_60px_rgba(255,46,136,0.4)]" />
        </motion.div>

        <motion.h1
          {...fade(0.25)}
          className="mt-9 font-display text-4xl font-bold leading-[1.08] text-white sm:mt-12 sm:text-6xl lg:text-7xl"
        >
          Where Beauty Meets <span className="pink-text">Confidence</span>
        </motion.h1>

        <motion.p
          {...fade(0.35)}
          className="mt-5 font-script text-2xl text-pink-soft sm:text-4xl"
        >
          Luxury hair care, crafted around you
        </motion.p>

        <motion.p
          {...fade(0.45)}
          className="mt-5 text-[11px] font-semibold uppercase tracking-[0.38em] silver-text sm:text-sm sm:tracking-[0.42em]"
        >
          Confidence<span className="text-pink"> · </span>Presentation
          <span className="text-pink"> · </span>Consistency
        </motion.p>

        <motion.p
          {...fade(0.55)}
          className="mt-7 max-w-xl text-sm leading-relaxed text-silver-dim sm:mt-8 sm:text-base"
        >
          A refined salon experience built around your hair, your features, and
          how you want to show up — with polished results that stay consistent
          every single visit.
        </motion.p>

        <motion.div
          {...fade(0.65)}
          className="mt-9 flex w-full flex-col items-center justify-center gap-3.5 sm:mt-11 sm:flex-row sm:gap-4"
        >
          <a href="#contact" className="btn-primary w-full sm:w-auto">
            Book Appointment <ArrowIcon className="h-4 w-4" />
          </a>
          <a href="#contact" className="btn-ghost w-full sm:w-auto">
            Request Information
          </a>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />
    </section>
  );
}
