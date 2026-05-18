import { motion } from 'framer-motion';
import {
  InstagramIcon,
  FacebookIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
} from './icons.jsx';

const channels = [
  { icon: InstagramIcon, label: 'Instagram', value: '@trhuehaircare', href: '#' },
  { icon: FacebookIcon, label: 'Facebook', value: 'TRHUE Hair Care', href: '#' },
  { icon: PhoneIcon, label: 'Business Phone', value: '(513) 555-0100', href: 'tel:+15135550100' },
  { icon: MailIcon, label: 'Business Email', value: 'hello@trhuehaircare.com', href: 'mailto:hello@trhuehaircare.com' },
];

export default function SocialContact() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="container-x">
        <div className="mb-12 text-center">
          <span className="section-eyebrow">Connect With Us</span>
          <h2 className="section-title text-white">
            Stay <span className="pink-text">In Touch</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.a
                key={c.label}
                href={c.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex flex-col items-center gap-4 rounded-3xl glass p-8 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-pink/40 hover:shadow-card"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-pink/30 bg-pink/10 text-pink-soft transition-all duration-500 group-hover:scale-110 group-hover:text-white group-hover:shadow-glow">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-silver-dim">
                    {c.label}
                  </p>
                  <p className="mt-1.5 font-display text-lg font-semibold text-white">
                    {c.value}
                  </p>
                </div>
              </motion.a>
            );
          })}
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.28em] text-silver-dim">
          <MapPinIcon className="h-4 w-4 text-pink" />
          Serving Cincinnati, Ohio and surrounding areas
        </div>
      </div>
    </section>
  );
}
