import Logo from './Logo.jsx';
import { PhoneIcon, MailIcon, InstagramIcon, FacebookIcon } from './icons.jsx';
import { SITE } from '../lib/site.js';

const navLinks = ['Services', 'Pricing', 'Collection', 'Contact'];

const contacts = [
  { icon: PhoneIcon, label: SITE.phoneDisplay, href: SITE.phoneTel },
  { icon: MailIcon, label: SITE.email, href: SITE.emailHref },
  { icon: InstagramIcon, label: SITE.social.instagram.name, href: SITE.social.instagram.href },
  { icon: FacebookIcon, label: SITE.social.facebook.name, href: SITE.social.facebook.href },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink/60 to-transparent" />
      <div className="container-x py-14 sm:py-16">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="flex flex-col items-center text-center lg:col-span-4 lg:items-start lg:text-left">
            <Logo className="h-20 w-auto drop-shadow-[0_0_24px_rgba(255,46,136,0.3)] sm:h-24" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-silver-dim">
              Luxury hair care and beauty services built around confidence,
              consistency, and presentation.
            </p>
            <a
              href={SITE.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-[11px] uppercase tracking-[0.28em] text-pink-soft transition-colors hover:text-white"
            >
              {SITE.address.full}
            </a>
          </div>

          {/* Explore */}
          <div className="text-center lg:col-span-2 lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-silver-dim">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {navLinks.map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className="text-sm font-medium text-silver transition-colors hover:text-white"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center lg:col-span-3 lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-silver-dim">
              Contact
            </p>
            <ul className="mt-5 space-y-3.5">
              {contacts.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target={c.href.startsWith('http') ? '_blank' : undefined}
                      rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-3 text-sm text-silver transition-colors hover:text-pink-soft"
                    >
                      <Icon className="h-4 w-4 flex-none text-pink" />
                      {c.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Hours */}
          <div className="text-center lg:col-span-3 lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-silver-dim">
              Business Hours
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-center gap-2 lg:justify-between">
                <span className="text-silver">Mon – Sat</span>
                <span className="font-semibold text-white">By Appointment</span>
              </div>
              <div className="flex items-center justify-center gap-2 lg:justify-between">
                <span className="text-silver">Sunday</span>
                <span className="font-semibold text-pink-soft">Closed</span>
              </div>
              <a href="#contact" className="btn-ghost mt-5 inline-flex !px-6 !py-3 !text-xs">
                Request Appointment
              </a>
            </div>
          </div>
        </div>

        {/* A1 Creative proof footer */}
        <div className="mt-14 rounded-3xl glass p-7 text-center sm:p-9">
          <p className="font-display text-base font-semibold text-white sm:text-lg">
            Built as a <span className="pink-text">Community Access System</span> by
            A1 Creative Agency.
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.24em] text-silver-dim sm:text-sm sm:tracking-[0.28em]">
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
          <p>© {new Date().getFullYear()} TRHUE Hair Care. All rights reserved.</p>
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
