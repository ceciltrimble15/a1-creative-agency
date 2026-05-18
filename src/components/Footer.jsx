import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-coal">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink/60 to-transparent" />
      <div className="container-x py-16">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo className="h-20 w-auto drop-shadow-[0_0_24px_rgba(255,46,136,0.3)]" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-silver-dim">
              Professional beauty and hair care services helping clients look
              polished, confident, and cared for.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.28em] text-pink-soft">
              Serving Cincinnati, Ohio
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
            {['Services', 'Gallery', 'Book', 'Contact'].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm font-medium uppercase tracking-[0.16em] text-silver-dim transition-colors hover:text-white"
              >
                {l}
              </a>
            ))}
          </nav>
        </div>

        {/* A1 Creative proof footer */}
        <div className="mt-14 rounded-3xl glass p-8 text-center">
          <p className="font-display text-lg font-semibold text-white">
            Built as a <span className="pink-text">Community Access System</span> by
            A1 Creative Agency.
          </p>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.28em] text-silver-dim">
            Websites <span className="text-pink">·</span> Branding
            <span className="text-pink"> ·</span> Automation
            <span className="text-pink"> ·</span> Lead Systems
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-xs leading-relaxed text-silver-dim/80">
            This project serves as a demonstration of A1 Creative’s starter
            business infrastructure system for local brands — a landing page,
            lead capture surface, booking bridge, and QR-ready business setup in
            one launch-ready asset.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs text-silver-dim sm:flex-row">
          <p>
            © {new Date().getFullYear()} TRHUE Hair Care. All rights reserved.
          </p>
          <p className="uppercase tracking-[0.24em]">
            Beauty<span className="text-pink">.</span> Care
            <span className="text-pink">.</span> Confidence
            <span className="text-pink">.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
