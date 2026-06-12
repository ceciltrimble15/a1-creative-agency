import { Link } from 'react-router-dom';
import {
  ArrowIcon, ArrowRightIcon, GlobeIcon, QrIcon, DatabaseIcon,
  MessageIcon, CalendarIcon, ZapIcon, CheckIcon, LayersIcon,
} from '../components/icons.jsx';

const FLOW_STEPS = [
  {
    icon: GlobeIcon,
    step: '01',
    title: 'Visitor Arrives',
    sub: 'Website or QR Code',
    desc: 'Your website or QR code is the first point of contact. A professionally built page communicates credibility immediately and routes the visitor toward an action.',
    detail: 'A1 builds the page, the messaging, and the routing — all optimized for capture.',
  },
  {
    icon: QrIcon,
    step: '02',
    title: 'Lead Captured',
    sub: 'Intake Form or Funnel',
    desc: 'The visitor submits a form — their name, contact info, service interest, timeline, and budget. That data goes directly into your system.',
    detail: 'No leads lost to a generic "contact us" email that goes unread for three days.',
  },
  {
    icon: DatabaseIcon,
    step: '03',
    title: 'CRM Updated',
    sub: 'Airtable Pipeline Entry',
    desc: 'A new record is automatically created in your Airtable CRM. The lead is tagged, staged, and visible in your pipeline — immediately.',
    detail: 'You see every lead. You know exactly where they came from and what they need.',
  },
  {
    icon: MessageIcon,
    step: '04',
    title: 'Alert Sent',
    sub: 'Twilio Text Automation',
    desc: 'You get a text notification the moment a lead comes in. If a call was missed, the lead gets an automatic text within seconds of the missed call.',
    detail: 'Speed of response is the #1 factor in closing. This keeps you first.',
  },
  {
    icon: CalendarIcon,
    step: '05',
    title: 'Follow-Up Scheduled',
    sub: 'Automated Sequence',
    desc: 'If the lead doesn\'t book immediately, a follow-up sequence kicks in. Reminders, check-ins, and re-engagement messages go out on a schedule.',
    detail: 'Most businesses have zero follow-up. This is where you separate from everyone else.',
  },
  {
    icon: ZapIcon,
    step: '06',
    title: 'Client Closes',
    sub: 'Deal Tracked & Logged',
    desc: 'The client books, signs, pays, or confirms. The deal is logged in your CRM. A review request goes out after the job is done.',
    detail: 'The cycle is complete. Your pipeline moves. Your reviews grow.',
  },
];

const DIFFERENCES = [
  {
    without: 'Website with no intake form',
    with: 'Website connected to lead capture + CRM',
  },
  {
    without: 'Phone number on a flyer that nobody calls',
    with: 'QR code that routes directly to a booking form',
  },
  {
    without: 'Missed call = lost customer',
    with: 'Missed call → automatic text within seconds',
  },
  {
    without: 'Leads stored in a notebook or text thread',
    with: 'Every lead in a structured Airtable pipeline',
  },
  {
    without: 'Manual follow-up that never happens',
    with: 'Automated follow-up sequence on every lead',
  },
  {
    without: 'No idea where business comes from',
    with: 'Lead source tracking and pipeline visibility',
  },
];

const TOOLS = [
  { name: 'Website', role: 'Front-end capture surface' },
  { name: 'QR Code', role: 'Offline-to-online bridge' },
  { name: 'Intake Form', role: 'Structured lead data collection' },
  { name: 'Airtable CRM', role: 'Pipeline and client management' },
  { name: 'Twilio', role: 'SMS alerts and automation' },
  { name: 'Calendly / Booking', role: 'Self-service scheduling' },
  { name: 'Follow-Up Sequences', role: 'Automated nurture and re-engagement' },
  { name: 'Review System', role: 'Post-service reputation building' },
];

export default function Infrastructure() {
  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-hero-gradient opacity-60" />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>
        <div className="container-x relative z-10">
          <span className="section-eyebrow">How It Works</span>
          <h1 className="section-title max-w-3xl">
            We don't just build pages.{' '}
            <span className="blue-text">We build the system behind the page.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-silver-dim leading-relaxed text-lg">
            Most agencies hand you a website and disappear. A1 Creative connects every
            piece of your business — website, lead capture, CRM, automation, booking,
            and follow-up — into one working system.
          </p>
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="py-16 pb-24">
        <div className="container-x">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white">
              The A1 Infrastructure Flow
            </h2>
            <p className="mt-2 text-silver-dim">Visitor → Closed client. Fully connected.</p>
          </div>

          <div className="space-y-4">
            {FLOW_STEPS.map(({ icon: Icon, step, title, sub, desc, detail }, i) => (
              <div key={step} className="relative">
                <div className="card p-8 group hover:border-blue/25">
                  <div className="grid gap-6 lg:grid-cols-[auto_1fr_1fr] lg:items-start">
                    {/* Step indicator + icon */}
                    <div className="flex items-center gap-4 lg:flex-col lg:items-center lg:w-24">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-blue bg-blue/[0.08] text-blue group-hover:bg-blue/15 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-blue/60 tracking-[0.3em]">STEP {step}</div>
                        <div className="text-sm font-bold text-white mt-0.5 lg:text-center">{title}</div>
                        <div className="text-xs text-silver-dim mt-0.5 lg:text-center">{sub}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-silver-dim leading-relaxed text-sm">{desc}</p>
                    </div>

                    {/* What A1 does */}
                    <div className="rounded bg-blue/[0.04] border border-blue/10 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue mb-2">
                        A1 System Advantage
                      </p>
                      <p className="text-sm text-silver-dim leading-relaxed">{detail}</p>
                    </div>
                  </div>
                </div>

                {i < FLOW_STEPS.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="flex h-8 w-8 items-center justify-center text-blue/30">
                      <ArrowIcon className="h-5 w-5 rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Without vs With */}
      <section className="py-24 bg-graphite/20">
        <div className="container-x">
          <div className="text-center mb-12">
            <span className="section-eyebrow">The Difference</span>
            <h2 className="section-title">
              Without A1 vs.{' '}
              <span className="blue-text">With A1.</span>
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Without */}
            <div className="rounded-lg border border-white/[0.06] bg-graphite p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-silver-dark" />
                <h3 className="font-bold text-silver-dim text-lg">Without A System</h3>
              </div>
              <ul className="space-y-3">
                {DIFFERENCES.map(({ without }) => (
                  <li key={without} className="flex items-start gap-3 text-sm text-silver-dark">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-silver-dark/40 shrink-0" />
                    {without}
                  </li>
                ))}
              </ul>
            </div>

            {/* With */}
            <div className="rounded-lg border border-blue/25 bg-graphite p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-blue" />
                <h3 className="font-bold text-blue text-lg">With A1 Infrastructure</h3>
              </div>
              <ul className="space-y-3">
                {DIFFERENCES.map(({ with: withVal }) => (
                  <li key={withVal} className="flex items-start gap-3 text-sm text-silver">
                    <CheckIcon className="h-4 w-4 text-blue shrink-0 mt-0.5" />
                    {withVal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Stack */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <div className="text-center mb-12">
            <span className="section-eyebrow">The Stack</span>
            <h2 className="section-title">
              The tools that power{' '}
              <span className="blue-text">your business system.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map(({ name, role }) => (
              <div key={name} className="card text-center p-6">
                <div className="text-sm font-bold text-white mb-1">{name}</div>
                <div className="text-xs text-silver-dim">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-graphite/20">
        <div className="container-x">
          <div className="relative rounded-xl border border-blue/20 bg-graphite p-12 text-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-hero-gradient opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to build your system?
              </h2>
              <p className="text-silver-dim max-w-lg mx-auto mb-8">
                Tell us where your business is today and we'll show you exactly
                what infrastructure you need.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://a1creativeagency.com/quote" className="btn-primary">
                  Start Your Build <ArrowIcon className="h-4 w-4" />
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
