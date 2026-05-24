import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowIcon, PhoneIcon, MailIcon, MapPinIcon } from './icons.jsx';
import { SITE } from '../lib/site.js';

const serviceOptions = [
  'Silk Press',
  'Roll & Set',
  'Ponytail',
  'Quick Weave',
  'Sew-In',
  'Short Style Curl',
  'Color',
  'Pretty Hair Care Collection',
  'Other / Not Sure',
];

const fieldClass =
  'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white placeholder:text-silver-dim/70 outline-none transition-all duration-300 focus:border-pink/60 focus:bg-white/[0.05] focus:shadow-glow';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const form = e.target;
    const body = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      service: form.service.value,
      date: form.date.value,
      message: form.message.value,
    };

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed. Please try again.');
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-pink/10 blur-[140px]" />
      <div className="container-x relative grid items-start gap-14 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-eyebrow">Request Appointment</span>
          <h2 className="section-title text-white">
            Let’s Get You <span className="pink-text">Booked</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-silver-dim">
            Share a few details and the TRHUE Hair Care team will follow up to
            confirm your appointment, answer questions, and prepare for your
            visit.
          </p>

          <div className="mt-10 space-y-5">
            {[
              ['Personalized consultation', 'Every look starts with understanding your hair.'],
              ['Flexible scheduling', 'Appointments arranged around your availability.'],
              ['Premium experience', 'Salon-grade care from start to finish.'],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-4">
                <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-pink shadow-glow" />
                <div>
                  <p className="font-display text-lg font-semibold text-white">{t}</p>
                  <p className="text-sm text-silver-dim">{d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-3.5 border-t border-white/10 pt-8">
            <a
              href={SITE.phoneTel}
              className="group flex items-center gap-3.5 text-sm text-silver transition-colors hover:text-pink-soft"
            >
              <PhoneIcon className="h-4 w-4 flex-none text-pink" />
              {SITE.phoneDisplay}
            </a>
            <a
              href={SITE.emailHref}
              className="group flex items-center gap-3.5 text-sm text-silver transition-colors hover:text-pink-soft"
            >
              <MailIcon className="h-4 w-4 flex-none text-pink" />
              {SITE.email}
            </a>
            <a
              href={SITE.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 text-sm text-silver transition-colors hover:text-pink-soft"
            >
              <MapPinIcon className="h-4 w-4 flex-none text-pink" />
              {SITE.address.full}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl glass p-7 sm:p-9"
        >
          <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-pink/15 blur-3xl" />

          {submitted ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-pink/40 bg-pink/15 text-pink shadow-glow">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-white">
                Request Received
              </h3>
              <p className="mt-3 max-w-sm text-sm text-silver-dim">
                Thank you. Your appointment request has been captured. The TRHUE
                Hair Care team will reach out shortly to confirm the details.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-ghost mt-8 !py-3 !text-xs"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-silver-dim">
                    Name
                  </label>
                  <input required type="text" name="name" placeholder="Full name" className={fieldClass} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-silver-dim">
                    Phone
                  </label>
                  <input required type="tel" name="phone" placeholder="Your phone number" className={fieldClass} />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-silver-dim">
                  Email
                </label>
                <input required type="email" name="email" placeholder="you@email.com" className={fieldClass} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-silver-dim">
                    Service Needed
                  </label>
                  <select required name="service" defaultValue="" className={`${fieldClass} appearance-none`}>
                    <option value="" disabled>
                      Select a service
                    </option>
                    {serviceOptions.map((o) => (
                      <option key={o} value={o} className="bg-coal">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-silver-dim">
                    Preferred Date
                  </label>
                  <input type="date" name="date" className={`${fieldClass} [color-scheme:dark]`} />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-silver-dim">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Tell us about the look you want…"
                  className={`${fieldClass} resize-none`}
                />
              </div>

              {submitError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {submitError}
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'Sending…' : 'Request Appointment'} {!submitting && <ArrowIcon className="h-4 w-4" />}
              </button>

              <p className="text-center text-[11px] uppercase tracking-[0.22em] text-silver-dim/70">
                Appointments available by request
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
