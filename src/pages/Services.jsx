import { Link } from 'react-router-dom';
import {
  ArrowIcon, GlobeIcon, LayersIcon, QrIcon, DatabaseIcon,
  MessageIcon, CalendarIcon, ZapIcon, BarChartIcon, CheckIcon, RefreshIcon, StarIcon,
} from '../components/icons.jsx';

const SERVICES = [
  {
    icon: GlobeIcon,
    name: 'Website & Landing Page',
    outcome: 'Visitors turn into inquiries — not just impressions.',
    desc: 'A professionally built website is the first signal of legitimacy. We build sites that load fast, communicate your value clearly, and are connected to your lead system from day one.',
    deliverables: [
      'Responsive, mobile-first design',
      'Clear service and offer structure',
      'Contact and intake form integration',
      'SEO-ready structure and meta setup',
      'Connected to your CRM and booking flow',
    ],
  },
  {
    icon: LayersIcon,
    name: 'Brand Identity',
    outcome: 'Your business looks like it belongs at the next level.',
    desc: 'Logo, colors, typography, and brand guidelines. Built for consistency across your website, business cards, social media, and client communications.',
    deliverables: [
      'Primary logo and variations',
      'Color system and typography guide',
      'Business card / flyer template',
      'Social media profile assets',
      'Brand usage guidelines',
    ],
  },
  {
    icon: BarChartIcon,
    name: 'Lead Capture System',
    outcome: 'Every visitor becomes a trackable lead, not a lost opportunity.',
    desc: 'Forms, funnels, and intake flows designed to capture contact information and route leads directly into your CRM pipeline — automatically.',
    deliverables: [
      'Multi-field intake form design',
      'Form → CRM auto-routing',
      'Lead notification to business owner',
      'Thank-you page and confirmation flow',
      'Lead source tracking',
    ],
  },
  {
    icon: QrIcon,
    name: 'QR Funnel System',
    outcome: 'Print materials become a live lead pipeline.',
    desc: 'QR codes connected to landing pages, intake forms, or booking flows. Put them on flyers, business cards, packaging, or anywhere your customers are.',
    deliverables: [
      'Custom QR code generation',
      'Destination landing page or form',
      'Lead capture on QR scan',
      'CRM routing on submission',
      'Printable QR assets',
    ],
  },
  {
    icon: DatabaseIcon,
    name: 'Airtable CRM Setup',
    outcome: 'You know exactly where every lead and client stands.',
    desc: 'A clean, organized business pipeline in Airtable. Track leads, active clients, project status, follow-up tasks, and revenue — all in one place.',
    deliverables: [
      'Lead and client pipeline setup',
      'Status fields and pipeline stages',
      'Automated record creation from forms',
      'Task and follow-up tracking',
      'Team collaboration ready',
    ],
  },
  {
    icon: MessageIcon,
    name: 'Missed-Call Text Recovery',
    outcome: 'You never lose a customer because you were busy.',
    desc: 'When a call goes unanswered, an automatic text goes out within seconds. Built on Twilio. Keeps the conversation open and the lead warm.',
    deliverables: [
      'Twilio number setup',
      'Missed-call trigger configuration',
      'Custom text message templates',
      'Lead capture via SMS reply',
      'CRM sync on response',
    ],
  },
  {
    icon: CalendarIcon,
    name: 'Booking & Intake System',
    outcome: 'Customers book themselves. You get structured data.',
    desc: 'Calendly or custom booking flow connected to your intake form, CRM, and confirmation system. No more back-and-forth scheduling.',
    deliverables: [
      'Booking calendar setup',
      'Pre-booking intake form',
      'Automatic confirmation messages',
      'Calendar sync',
      'CRM entry on booking',
    ],
  },
  {
    icon: RefreshIcon,
    name: 'Review & Follow-Up System',
    outcome: 'Happy customers leave reviews. Leads get followed up.',
    desc: 'Post-service review requests, follow-up sequences, and re-engagement messages — sent automatically based on client status in your CRM.',
    deliverables: [
      'Review request automation',
      'Google review link setup',
      'Post-service follow-up sequence',
      'Inactive lead re-engagement flow',
      'Customer satisfaction check-in',
    ],
  },
  {
    icon: ZapIcon,
    name: 'Business Automation Infrastructure',
    outcome: 'Your business runs in the background while you do the work.',
    desc: 'Connecting your tools — website, CRM, booking, messaging, and follow-up — into one automated flow. Reduce manual work. Reduce dropped balls.',
    deliverables: [
      'Workflow mapping and design',
      'Tool integration setup',
      'Trigger and action configuration',
      'Automation testing and QA',
      'Documentation for your team',
    ],
  },
  {
    icon: StarIcon,
    name: 'Client Intake System',
    outcome: 'New clients onboard themselves. You start ready.',
    desc: 'Intake forms, onboarding questionnaires, and welcome sequences that collect everything you need before the first meeting — so you show up prepared.',
    deliverables: [
      'Intake form design and build',
      'Onboarding questionnaire',
      'Welcome message automation',
      'Document collection flow',
      'CRM profile creation on submit',
    ],
  },
];

export default function Services() {
  return (
    <>
      {/* Page Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-hero-gradient opacity-50" />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>
        <div className="container-x relative z-10">
          <span className="section-eyebrow">Infrastructure Modules</span>
          <h1 className="section-title max-w-3xl">
            Every service we offer is a{' '}
            <span className="blue-text">working piece of your business system.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-silver-dim leading-relaxed text-lg">
            We don't sell features. We build business outcomes. Every module connects
            to the next — creating a complete infrastructure for how your business
            attracts, captures, and closes customers.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 pb-32">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-2">
            {SERVICES.map(({ icon: Icon, name, outcome, desc, deliverables }) => (
              <div key={name} className="card group p-8">
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-blue/[0.08] text-blue group-hover:bg-blue/15 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{name}</h2>
                    <p className="mt-1 text-sm font-semibold text-blue">{outcome}</p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-silver-dim">{desc}</p>

                <div className="mt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-silver-dark mb-3">
                    What's Included
                  </p>
                  <ul className="space-y-2">
                    {deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2.5 text-sm text-silver-dim">
                        <CheckIcon className="h-4 w-4 text-blue shrink-0 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-xl border border-blue/20 bg-graphite p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Need the full system?
            </h2>
            <p className="text-silver-dim max-w-lg mx-auto mb-8">
              Most businesses need more than one module. Our packages bundle the
              right pieces together at a structured price.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/packages" className="btn-primary">
                View Packages <ArrowIcon className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn-ghost">
                Talk To Us First
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
