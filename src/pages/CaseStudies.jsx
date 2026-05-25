import { Link } from 'react-router-dom';
import { ArrowIcon } from '../components/icons.jsx';

const CASE_STUDIES = [
  {
    client: 'TRHUE Hair Care',
    industry: 'Beauty / Hair Care Studio',
    location: 'Cincinnati, OH',
    status: 'In Build',
    statusColor: 'bg-blue/10 text-blue border-blue/20',
    problem: 'No professional web presence. No lead capture. No QR system for in-person marketing. A skilled stylist with no digital infrastructure to support client acquisition.',
    system: 'Community Access System website, brand presentation cleanup, intake contact form, QR code routing from printed materials, social media profile assets, booking bridge integration.',
    outcome: 'Professional web presence launched. Lead capture connected. QR codes on business materials routing directly to intake form. Booking infrastructure in place.',
    modules: ['Website / Landing Page', 'Brand Cleanup', 'Lead Capture Form', 'QR Routing System', 'Booking Bridge'],
  },
  {
    client: '4Real Cleaning',
    industry: 'Cleaning Services',
    location: 'Local Market',
    status: 'Infrastructure in Progress',
    statusColor: 'bg-silver-dark/10 text-silver-dim border-white/[0.06]',
    problem: 'Leads coming in through word of mouth only. No intake system, no CRM, no way to track quotes or follow up on jobs not yet booked. Business growing but infrastructure not keeping up.',
    system: 'Multi-page website with service detail pages, lead capture form with service type selection, Airtable CRM with lead pipeline, Twilio missed-call text setup, quote follow-up sequence.',
    outcome: 'Infrastructure in progress. Lead pipeline being configured. Automated text recovery being tested.',
    modules: ['Multi-Page Website', 'Lead Capture', 'Airtable CRM', 'Twilio Recovery', 'Follow-Up Flow'],
  },
  {
    client: "Earth's Clean & Pure",
    industry: 'Natural / Organic Products',
    location: 'E-commerce + Local',
    status: 'Prototype',
    statusColor: 'bg-gold/10 text-gold border-gold/20',
    problem: 'Product brand with no consistent online presence. No brand guidelines. No structured customer acquisition channel. Selling by DM with no formal checkout or lead system.',
    system: 'Brand identity system, landing page for product line, QR funnel for packaging, lead capture for newsletter/restock alerts, basic e-commerce bridge.',
    outcome: 'Prototype brand system complete. Website and QR funnel in design phase.',
    modules: ['Brand Identity', 'Landing Page', 'QR Funnel', 'Lead Capture', 'E-commerce Bridge'],
  },
  {
    client: 'A1 Creative — Internal System',
    industry: 'Business Infrastructure',
    location: 'Agency',
    status: 'Live',
    statusColor: 'bg-blue/10 text-blue border-blue/30',
    problem: 'As a business infrastructure company, A1 Creative needed to demonstrate its own methodology — operating with the same systems we build for clients.',
    system: 'This website (full multi-page infrastructure), Airtable CRM for leads and projects, intake form connected to pipeline, Twilio alert on new submissions, follow-up sequences, project tracking.',
    outcome: 'Fully operational. Every lead that comes through this site enters the A1 pipeline automatically. The system behind the brand is the same system we sell.',
    modules: ['Full Website System', 'Lead Pipeline CRM', 'Twilio Alerts', 'Project Tracking', 'Client Intake'],
  },
];

export default function CaseStudies() {
  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-hero-gradient opacity-50" />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>
        <div className="container-x relative z-10">
          <span className="section-eyebrow">Case Studies</span>
          <h1 className="section-title max-w-3xl">
            Real systems.{' '}
            <span className="blue-text">Real businesses.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-silver-dim leading-relaxed text-lg">
            A1 Creative works with local businesses to build infrastructure that
            actually changes how they operate. These are the systems we've built,
            are building, and are running right now.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded border border-white/[0.06] bg-white/[0.02] px-4 py-2">
            <span className="text-xs text-silver-dim">
              No fake results. No inflated claims. Status listed as-is.
            </span>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-12 pb-32">
        <div className="container-x space-y-8">
          {CASE_STUDIES.map(
            ({ client, industry, location, status, statusColor, problem, system, outcome, modules }) => (
              <div key={client} className="card p-0 overflow-hidden">
                {/* Card header */}
                <div className="border-b border-white/[0.06] p-8 pb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{client}</h2>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-silver-dim">
                        <span>{industry}</span>
                        <span className="text-white/20">·</span>
                        <span>{location}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-block rounded border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusColor}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="grid gap-0 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
                  <div className="p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-silver-dark mb-3">
                      The Problem
                    </p>
                    <p className="text-sm text-silver-dim leading-relaxed">{problem}</p>
                  </div>
                  <div className="p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue mb-3">
                      System Built
                    </p>
                    <p className="text-sm text-silver-dim leading-relaxed">{system}</p>
                  </div>
                  <div className="p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-silver-dark mb-3">
                      Business Outcome
                    </p>
                    <p className="text-sm text-silver-dim leading-relaxed mb-5">{outcome}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {modules.map((m) => (
                        <span
                          key={m}
                          className="inline-block rounded bg-blue/[0.06] border border-blue/10 px-2.5 py-1 text-[10px] font-medium text-blue/80"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-graphite/20">
        <div className="container-x">
          <div className="relative rounded-xl border border-blue/20 bg-graphite p-12 text-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-hero-gradient opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Want your business to be next?
              </h2>
              <p className="text-silver-dim max-w-lg mx-auto mb-8">
                Tell us about your business. We'll identify the exact infrastructure
                you need and build it right.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="btn-primary">
                  Start Your Build <ArrowIcon className="h-4 w-4" />
                </Link>
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
