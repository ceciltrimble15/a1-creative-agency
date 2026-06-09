import { useState } from 'react';
import { CheckIcon, MailIcon, PhoneIcon, ExternalLinkIcon, CalendarIcon } from '../components/icons.jsx';
import { SITE } from '../lib/site.js';

const FORM_NAME    = 'a1-creative-quote';
const FUNCTION_URL = '/.netlify/functions/a1-lead';
const FALLBACK_MSG = 'Something went wrong. Please call (513) 440-3329 or email operations@a1creativeagency.com.';

const SERVICE_OPTIONS = [
  'Website / Landing Page',
  'Brand Identity',
  'Lead Capture System',
  'QR Funnel System',
  'Airtable CRM Setup',
  'Missed-Call Text Recovery',
  'Booking & Intake System',
  'Review & Follow-Up System',
  'Business Automation',
  'Full Infrastructure Build (VIP)',
  'Not sure — I need guidance',
];

const BUDGET_OPTIONS = [
  'Under $1,500',
  '$1,500 – $3,500 (Starter)',
  '$3,500 – $7,500 (Growth)',
  '$7,500+ (VIP / Custom)',
  'Not sure yet',
];

const TIMELINE_OPTIONS = [
  'ASAP — ready to start now',
  'Within 30 days',
  '1–3 months out',
  'Just exploring for now',
];

const INITIAL = {
  businessName: '',
  name: '',
  phone: '',
  email: '',
  service: '',
  budget: '',
  timeline: '',
  message: '',
  botField: '',
};

// Netlify Forms fallback encoder (kept for static form detection only)
const encode = (data) =>
  Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&');

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-silver mb-2">
        {label}
        {required && <span className="text-blue ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded bg-graphite border border-white/[0.08] px-4 py-3 text-sm text-silver placeholder-silver-dark/60 outline-none transition-colors focus:border-blue/50 focus:bg-graphite-light';

const selectClass = inputClass + ' cursor-pointer';

// (FALLBACK_MSG defined at top of file)

export default function Contact() {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(FUNCTION_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          email:        form.email,
          phone:        form.phone,
          businessName: form.businessName,
          service:      form.service,
          budget:       form.budget,
          timeline:     form.timeline,
          message:      form.message,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = json?.error || `Status ${res.status}`;
        throw new Error(detail);
      }

      setStatus('success');
      setForm(INITIAL);

      // Also send Netlify Forms backup — fire-and-forget, never blocks success UX
      fetch('/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name':     FORM_NAME,
          'bot-field':     form.botField,
          'business-name': form.businessName,
          name:            form.name,
          phone:           form.phone,
          email:           form.email,
          service:         form.service,
          budget:          form.budget,
          timeline:        form.timeline,
          message:         form.message,
        }),
      }).catch(() => {});

    } catch (err) {
      console.error('[contact-form] Submission error:', err.message);
      setStatus('error');
      setErrorMsg(FALLBACK_MSG);
    }
  };

  return (
    <>
      {/* Page Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-hero-gradient opacity-50" />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>
        <div className="container-x relative z-10">
          <span className="section-eyebrow">Get In Touch</span>
          <h1 className="section-title max-w-2xl">
            Start your{' '}
            <span className="blue-text">business system.</span>
          </h1>
          <p className="mt-4 max-w-xl text-silver-dim leading-relaxed">
            Tell us about your business. We'll review your submission and follow up
            within one business day.
          </p>
        </div>
      </section>

      <section className="py-8 pb-32">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">

            {/* Form card */}
            <div className="rounded-xl border border-white/[0.06] bg-graphite p-8 lg:p-10">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue/[0.12] border border-blue/30 mb-5">
                    <CheckIcon className="h-8 w-8 text-blue" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Submission Received</h2>
                  <p className="text-silver-dim max-w-sm leading-relaxed">
                    We've received your project details. A1 Creative will follow up
                    within one business day to discuss your system build.
                  </p>
                </div>
              ) : (
                /* name + data-netlify are required by Netlify Forms on the rendered element.
                   The actual capture happens via the URL-encoded POST in handleSubmit. */
                <form
                  name={FORM_NAME}
                  method="POST"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Hidden inputs required by Netlify Forms */}
                  <input type="hidden" name="form-name" value={FORM_NAME} />

                  {/* Honeypot — hidden from real users, catches bots */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <label>
                      Don't fill this out if you're human:
                      <input
                        name="bot-field"
                        value={form.botField}
                        onChange={set('botField')}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Business Name" required>
                      <input
                        type="text"
                        name="business-name"
                        required
                        value={form.businessName}
                        onChange={set('businessName')}
                        placeholder="Your Business Name"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Your Name" required>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={set('name')}
                        placeholder="First & Last Name"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Phone Number" required>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={set('phone')}
                        placeholder="(XXX) XXX-XXXX"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Email Address" required>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@yourcompany.com"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Service Interest" required>
                    <select
                      name="service"
                      required
                      value={form.service}
                      onChange={set('service')}
                      className={selectClass}
                    >
                      <option value="">Select a service...</option>
                      {SERVICE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Budget Range">
                      <select
                        name="budget"
                        value={form.budget}
                        onChange={set('budget')}
                        className={selectClass}
                      >
                        <option value="">Select budget range...</option>
                        {BUDGET_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Timeline">
                      <select
                        name="timeline"
                        value={form.timeline}
                        onChange={set('timeline')}
                        className={selectClass}
                      >
                        <option value="">Select timeline...</option>
                        {TIMELINE_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Project Details">
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={set('message')}
                      rows={5}
                      placeholder="Tell us about your business, what you need, and any context that helps us understand where you are right now..."
                      className={inputClass + ' resize-none'}
                    />
                  </Field>

                  {status === 'error' && (
                    <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Project Details'
                    )}
                  </button>

                  <p className="text-center text-xs text-silver-dark">
                    We review every submission and follow up within one business day.
                  </p>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="card p-6">
                <h3 className="font-bold text-white mb-4">Contact</h3>
                <div className="space-y-4">
                  <a
                    href={SITE.emailHref}
                    className="flex items-center gap-3 text-sm text-silver-dim hover:text-blue transition-colors"
                  >
                    <MailIcon className="h-4 w-4 text-blue shrink-0" />
                    {SITE.email}
                  </a>
                  <a
                    href={SITE.phoneTel}
                    className="flex items-center gap-3 text-sm text-silver-dim hover:text-blue transition-colors"
                  >
                    <PhoneIcon className="h-4 w-4 text-blue shrink-0" />
                    {SITE.phoneDisplay}
                  </a>
                </div>
                <div className="divider my-5" />
                <p className="text-xs text-silver-dim mb-3">Prefer to talk first?</p>
                <a
                  href={SITE.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !text-xs !py-2.5 w-full text-center flex items-center justify-center gap-2"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Book a Strategy Call
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-white mb-4">What happens next</h3>
                <ol className="space-y-4">
                  {[
                    'You submit your project details above.',
                    'We review your submission and research your business.',
                    'We follow up within 1 business day to discuss your system.',
                    "If it's a fit, we send a scoped proposal and intake agreement.",
                    'You approve and deposit. We start building.',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-silver-dim">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue/[0.1] text-blue text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-white mb-3">
                  Not ready to submit yet?
                </h3>
                <p className="text-sm text-silver-dim mb-4">
                  Browse our packages to understand what each tier includes before
                  reaching out.
                </p>
                <a href="/packages" className="btn-ghost !text-xs !py-2.5 w-full text-center block">
                  View Packages
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
