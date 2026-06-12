import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { MailIcon, PhoneIcon, InstagramIcon } from './icons.jsx';
import { SITE } from '../lib/site.js';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/infrastructure', label: 'Infrastructure' },
  { to: '/packages', label: 'Packages' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const SERVICES = [
  'Website & Landing Pages',
  'Brand Identity',
  'Lead Capture Systems',
  'QR Funnel Systems',
  'Airtable CRM Setup',
  'Twilio Automation',
  'Booking & Intake Systems',
  'Customer Follow-Up',
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-navy">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue/40 to-transparent" />

      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-silver-dim">
              We build the business system behind the brand — websites, branding,
              CRM, lead capture, booking, and automation for businesses ready to
              close more customers.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={SITE.social.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded border border-white/[0.08] text-silver-dim transition-colors hover:border-blue/40 hover:text-blue"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={SITE.emailHref}
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded border border-white/[0.08] text-silver-dim transition-colors hover:border-blue/40 hover:text-blue"
              >
                <MailIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-silver-dim">
              Navigation
            </p>
            <ul className="mt-5 space-y-2.5">
              {NAV.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-silver transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-silver-dim">
              What We Build
            </p>
            <ul className="mt-5 space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s} className="text-sm text-silver-dim">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-silver-dim">
              Get In Touch
            </p>
            <div className="mt-5 space-y-4">
              <a
                href={SITE.emailHref}
                className="flex items-center gap-3 text-sm text-silver transition-colors hover:text-blue"
              >
                <MailIcon className="h-4 w-4 shrink-0 text-blue" />
                {SITE.email}
              </a>
              <a
                href={SITE.phoneTel}
                className="flex items-center gap-3 text-sm text-silver transition-colors hover:text-blue"
              >
                <PhoneIcon className="h-4 w-4 shrink-0 text-blue" />
                {SITE.phoneDisplay}
              </a>
            </div>
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-silver-dim mb-3">
                Ready to Start?
              </p>
              <Link to="/contact" className="btn-primary !text-xs !py-3 !px-5">
                Start Your System
              </Link>
            </div>
          </div>
        </div>

        <div className="divider mt-14" />

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-xs text-silver-dim sm:flex-row">
          <p>© {new Date().getFullYear()} A1 Creative. All rights reserved.</p>
          <p className="uppercase tracking-[0.2em]">
            Build The Business System Behind Your Brand
            <span className="text-blue">.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
