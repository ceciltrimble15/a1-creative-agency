import { motion } from 'framer-motion';
import {
  InstagramIcon,
  FacebookIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
} from './icons.jsx';
import { SITE } from '../lib/site.js';

const channels = [
  { icon: PhoneIcon, label: 'Call / Text', value: SITE.phoneDisplay, href: SITE.phoneTel },
  { icon: MailIcon, label: 'Email', value: SITE.email, href: SITE.emailHref },
  { icon: InstagramIcon, label: 'Instagram', value: SITE.social.instagram.name, href: SITE.social.instagram.href },
  { icon: FacebookIcon, label: 'Facebook', value: SITE.social.facebook.name, href: SITE.social.facebook.href },
];

const fade = (i) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, delay: i * 0.07 },
});

export default function SocialContact() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-pink/8 blur-[140px]" />
      <div className="container-x relative">
        <div className="mb-12 text-center sm:mb-14">
          <span className="section-eyebrow">Visit &amp; Connect</span>
          <h2 className="section-title text-white">
            Stay <span className="pink-text">In Touch</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {channels.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                {...fade(i)}
                className="group flex flex-col items-center gap-4 rounded-3xl glass p-7 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-pink/40 hover:shadow-card sm:p-8"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-pink/30 bg-pink/10 text-pink-soft transition-all duration-500 group-hover:scale-110 group-hover:text-white group-hover:shadow-glow">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-silver-dim sm:text-[11px]">
                    {c.label}
                  </p>
                  <p className="mt-1.5 font-display text-base font-semibold text-white sm:text-lg">
                    {c.value}
                  </p>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Location + Hours */}
        <div className="mt-5 grid gap-4 sm:gap-5 lg:grid-cols-2">
          <motion.a
            {...fade(1)}
            href={SITE.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-5 rounded-3xl glass p-7 transition-all duration-500 hover:-translate-y-1 hover:border-pink/40 hover:shadow-card sm:p-8"
          >
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-pink/30 bg-pink/10 text-pink-soft transition-all duration-500 group-hover:text-white group-hover:shadow-glow">
              <MapPinIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-silver-dim sm:text-[11px]">
                Location
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold text-white">
                {SITE.address.street}
              </p>
              <p className="mt-1 text-sm text-silver-dim">
                {SITE.address.cityState}
              </p>
            </div>
          </motion.a>

          <motion.div
            {...fade(2)}
            className="rounded-3xl glass p-7 sm:p-8"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-silver-dim sm:text-[11px]">
              Business Hours
            </p>
            <div className="mt-4 space-y-3">
              {SITE.hours.map((h, idx) => (
                <div
                  key={h.day}
                  className={`flex items-center justify-between ${
                    idx < SITE.hours.length - 1
                      ? 'border-b border-white/10 pb-3'
                      : ''
                  }`}
                >
                  <span className="text-sm text-silver">{h.day}</span>
                  <span
                    className={`font-display text-sm font-semibold ${
                      h.value === 'Closed' ? 'text-pink-soft' : 'text-white'
                    }`}
                  >
                    {h.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mobile-friendly call / text */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
          <a href={SITE.phoneTel} className="btn-primary w-full sm:w-auto">
            <PhoneIcon className="h-4 w-4" /> Call Now
          </a>
          <a href={SITE.phoneSms} className="btn-ghost w-full sm:w-auto">
            Text Us
          </a>
        </div>
      </div>
    </section>
  );
}
