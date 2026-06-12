import { Link } from 'react-router-dom';
import {
  ArrowIcon, CheckIcon, ZapIcon, DatabaseIcon, GlobeIcon,
  MessageIcon, CalendarIcon, QrIcon, BarChartIcon, LayersIcon,
} from '../components/icons.jsx';

const TRUST_ITEMS = [
  'Websites & Landing Pages',
  'CRM & Lead Pipelines',
  'Booking & Intake Systems',
  'Missed-Call Automation',
  'QR Funnel Systems',
  'Client Follow-Up Flows',
];

const WHAT_WE_BUILD = [
  {
    icon: GlobeIcon,
    title: 'Websites & Landing Pages',
    desc: 'Professional web presence built to convert visitors into inquiries — not just look good.',
  },
  {
    icon: LayersIcon,
    title: 'Brand Identity',
    desc: 'Logos, color systems, and brand assets that communicate credibility before you say a word.',
  },
  {
    icon: QrIcon,
    title: 'QR Funnel Systems',
    desc: 'Offline-to-online funnels. Print a QR code, capture leads, and route them into your system automatically.',
  },
  {
    icon: DatabaseIcon,
    title: 'Airtable CRM Setup',
    desc: 'A real business pipeline. Track leads, clients, and follow-ups in one organized system.',
  },
  {
    icon: MessageIcon,
    title: 'Missed-Call Recovery',
    desc: 'Every missed call triggers an automatic text. You stop losing customers who never heard back.',
  },
  {
    icon: CalendarIcon,
    title: 'Booking & Intake Systems',
    desc: 'Customers book themselves. You get structured intake data and automatic confirmations.',
  },
  {
    icon: ZapIcon,
    title: 'Business Automation',
    desc: 'Follow-up sequences, review requests, and task alerts — running 24/7 without your manual effort.',
  },
  {
    icon: BarChartIcon,
    title: 'Lead Capture Systems',
    desc: 'Forms, funnels, and capture flows that pull leads from your website, QR codes, and social.',
  },
];

const WHY_LOSE = [
  { stat: '78%', label: 'of customers go with the first business that responds' },
  { stat: '67%', label: 'of missed calls never call back' },
  { stat: '3x', label: 'more revenue from businesses with organized follow-up' },
  { stat: '0', label: 'customers closed from a website with no lead system behind it' },
];

const STACK_STEPS = [
  { label: 'Visitor arrives', detail: 'Website or QR code' },
  { label: 'Lead captured', detail: 'Intake form or funnel' },
  { label: 'CRM updated', detail: 'Airtable pipeline entry' },
  { label: 'Text alert sent', detail: 'Twilio automation' },
  { label: 'Follow-up task', detail: 'Scheduled sequence' },
  { label: 'Client closes', detail: 'Deal tracked & logged' },
];

const PACKAGES = [
  {
    name: 'Starter',
    subtitle: 'Community Access System',
    price: 'From $1,500',
    color: 'border-silver-dark',
    badge: null,
    items: ['Website or landing page', 'Basic brand cleanup', 'Contact / intake form', 'QR code routing', 'Booking bridge', '30-day light support'],
  },
  {
    name: 'Growth',
    subtitle: 'Business Growth Infrastructure',
    price: 'From $3,500',
    color: 'border-blue/50',
    badge: 'Most Popular',
    items: ['Multi-page website', 'Airtable CRM + pipeline', 'Twilio text alert setup', 'Booking & QR funnel', 'Follow-up automation', 'Review request flow'],
  },
  {
    name: 'VIP',
    subtitle: 'Full Infrastructure Build',
    price: 'From $7,500',
    color: 'border-gold/50',
    badge: 'Custom',
    items: ['Full website system', 'CRM + automation workflows', 'Missed-call recovery', 'Customer journey setup', 'Dashboard direction', 'Business operating system'],
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0 grid-bg opacity-60" />
          <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue/[0.06] blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-blue/[0.04] blur-[100px]" />
        </div>

        <div className="container-x relative z-10">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-blue/30 bg-blue/[0.06] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse-blue" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-blue">
                Business Infrastructure Systems
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[82px]">
              Build The Business System{' '}
              <span className="blue-text">Behind Your Brand.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-silver-dim sm:text-xl">
              A1 Creative builds websites, branding, lead capture, CRM, booking,
              follow-up, and automation systems for businesses that are ready to
              look professional and close more customers.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="https://a1creativeagency.com/quote" className="btn-primary">
                Start Your Business System <ArrowIcon className="h-4 w-4" />
              </a>
              <Link to="/packages" className="btn-ghost">
                View Packages
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3">
              {['No Fluff', 'No Cheap Templates', 'Real Business Infrastructure'].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-silver-dim">
                  <CheckIcon className="h-4 w-4 text-blue shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy to-transparent" />
      </section>

      {/* Trust Strip */}
      <section className="border-y border-white/[0.06] bg-graphite/30">
        <div className="container-x py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-silver-dim"
              >
                <span className="h-1 w-1 rounded-full bg-blue shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <div className="max-w-2xl mb-16">
            <span className="section-eyebrow">What We Build</span>
            <h2 className="section-title">
              Not a design shop.{' '}
              <span className="blue-text">A business infrastructure company.</span>
            </h2>
            <p className="mt-5 text-silver-dim leading-relaxed">
              Every module we build connects to the next. The result is a complete
              operating system for your business — not just a pretty website.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_WE_BUILD.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card group">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded bg-blue/[0.08] text-blue group-hover:bg-blue/15 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-silver-dim leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/services" className="btn-ghost">
              View All Services <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Businesses Lose Customers */}
      <section className="py-24 sm:py-32 bg-graphite/20">
        <div className="container-x">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="section-eyebrow">The Problem</span>
              <h2 className="section-title">
                Most businesses lose customers{' '}
                <span className="blue-text">before they ever talk to them.</span>
              </h2>
              <p className="mt-5 text-silver-dim leading-relaxed">
                Talented. Hardworking. Real service value. But no system behind the
                business. Leads fall through the cracks. Missed calls go unanswered.
                Follow-ups never happen. The work is good — the infrastructure is missing.
              </p>
              <p className="mt-4 text-silver-dim leading-relaxed">
                A1 Creative fixes that. We build the operational layer most local
                businesses don't know they're missing.
              </p>
              <Link to="/infrastructure" className="btn-primary mt-8 inline-flex">
                See How The System Works <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {WHY_LOSE.map(({ stat, label }) => (
                <div
                  key={stat}
                  className="rounded-lg border border-white/[0.06] bg-graphite p-6"
                >
                  <div className="text-4xl font-black text-blue mb-2">{stat}</div>
                  <p className="text-sm text-silver-dim leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Stack */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-eyebrow">The A1 Stack</span>
            <h2 className="section-title">
              The complete flow from{' '}
              <span className="blue-text">visitor to closed client.</span>
            </h2>
            <p className="mt-5 text-silver-dim leading-relaxed">
              Every piece connects. Every step is automated. Nothing falls through the cracks.
            </p>
          </div>

          <div className="relative">
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-0">
              {STACK_STEPS.map(({ label, detail }, i) => (
                <div key={label} className="flex flex-col sm:flex-row items-center">
                  <div className="flex flex-col items-center text-center w-full sm:w-32">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue bg-blue/[0.08] text-blue font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs text-silver-dim">{detail}</p>
                  </div>
                  {i < STACK_STEPS.length - 1 && (
                    <div className="flex items-center justify-center my-2 sm:my-0 sm:mx-1">
                      <ArrowIcon className="h-4 w-4 text-blue/40 sm:block hidden" />
                      <div className="h-6 w-px bg-blue/20 sm:hidden" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/infrastructure" className="btn-ghost">
              Explore The Full System <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Packages Preview */}
      <section className="py-24 sm:py-32 bg-graphite/20">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-eyebrow">Packages</span>
            <h2 className="section-title">
              Systems priced for where{' '}
              <span className="blue-text">your business is going.</span>
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {PACKAGES.map(({ name, subtitle, price, color, badge, items }) => (
              <div
                key={name}
                className={`relative rounded-lg border ${color} bg-graphite p-8 flex flex-col`}
              >
                {badge && (
                  <div className="absolute -top-3 left-6">
                    <span className={`inline-block rounded px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                      badge === 'Most Popular'
                        ? 'bg-blue text-white'
                        : 'bg-gold/20 text-gold border border-gold/30'
                    }`}>
                      {badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-silver-dim mb-1">
                    {subtitle}
                  </p>
                  <h3 className="text-2xl font-bold text-white">{name}</h3>
                  <p className="mt-2 text-xl font-semibold text-blue">{price}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-silver-dim">
                      <CheckIcon className="h-4 w-4 text-blue shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/packages"
                  className={name === 'Growth' ? 'btn-primary text-center' : 'btn-ghost text-center'}
                >
                  View Package
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/packages" className="btn-ghost">
              See Full Package Details <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Case Study Preview */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="section-eyebrow">Case Studies</span>
              <h2 className="section-title">
                Real systems.{' '}
                <span className="blue-text">Real businesses.</span>
              </h2>
              <p className="mt-5 text-silver-dim leading-relaxed">
                A1 Creative works with local brands to build and launch their full
                business infrastructure — from the website to the follow-up system.
                These are the systems we've built and are building right now.
              </p>
              <Link to="/case-studies" className="btn-primary mt-8 inline-flex">
                View Case Studies <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { name: 'TRHUE Hair Care', type: 'Website + Brand + QR System', status: 'In Build' },
                { name: '4Real Cleaning', type: 'Lead Capture + CRM + Booking', status: 'Infrastructure in Progress' },
                { name: "Earth's Clean & Pure", type: 'Brand + Website + Funnel', status: 'Prototype' },
                { name: 'A1 Creative Internal', type: 'Full Operating System', status: 'Live' },
              ].map(({ name, type, status }) => (
                <div key={name} className="card">
                  <div className={`inline-block mb-3 rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                    status === 'Live'
                      ? 'bg-blue/15 text-blue border border-blue/30'
                      : 'bg-silver-dark/20 text-silver-dim border border-white/[0.06]'
                  }`}>
                    {status}
                  </div>
                  <h4 className="font-semibold text-white text-sm">{name}</h4>
                  <p className="mt-1 text-xs text-silver-dim">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 bg-graphite/20">
        <div className="container-x">
          <div className="relative rounded-xl border border-blue/20 bg-graphite overflow-hidden px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue/50 to-transparent" />
              <div className="absolute inset-0 bg-hero-gradient opacity-40" />
            </div>
            <div className="relative z-10">
              <span className="section-eyebrow">Ready to Build?</span>
              <h2 className="section-title max-w-2xl mx-auto">
                Stop losing leads.{' '}
                <span className="blue-text">Start operating like a real company.</span>
              </h2>
              <p className="mt-5 text-silver-dim max-w-xl mx-auto leading-relaxed">
                Tell us about your business. We'll build the system behind your brand.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a href="https://a1creativeagency.com/quote" className="btn-primary">
                  Start Your Business System <ArrowIcon className="h-4 w-4" />
                </a>
                <Link to="/packages" className="btn-ghost">
                  View Packages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
