import { Link } from 'react-router-dom';
import { ArrowIcon, CheckIcon } from '../components/icons.jsx';

const VALUES = [
  {
    title: 'Infrastructure First',
    desc: 'We don\'t build pretty pages without purpose. Every project starts with understanding the business need, then building the system to solve it.',
  },
  {
    title: 'Outcomes Over Deliverables',
    desc: 'A website is not the goal. More customers, fewer dropped leads, and an organized pipeline — those are the goals. We build toward outcomes.',
  },
  {
    title: 'Operational Clarity',
    desc: 'Every system we build is something you can actually see and use. No black boxes. No "it\'s just running in the background." You own your infrastructure.',
  },
  {
    title: 'Community Access',
    desc: 'We believe local businesses deserve the same infrastructure that enterprise companies operate with. Our pricing reflects that belief.',
  },
];

const WHAT_SETS_APART = [
  'We connect every piece — website, CRM, automation, booking',
  'We build systems, not just design files',
  'We use real tools: Airtable, Twilio, Calendly',
  'Every build is documented and client-owned',
  'No bloated retainers — you own what we build',
  'We work with local businesses, not just tech startups',
];

export default function About() {
  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-hero-gradient opacity-50" />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>
        <div className="container-x relative z-10">
          <span className="section-eyebrow">About A1 Creative</span>
          <h1 className="section-title max-w-3xl">
            Built for businesses that have the skill{' '}
            <span className="blue-text">but not the system.</span>
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 pb-24">
        <div className="container-x">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 leading-snug">
                A lot of local businesses have talent, hustle, and real service value —
                but no system behind them.
              </h2>
              <div className="space-y-5 text-silver-dim leading-relaxed">
                <p>
                  A1 Creative was built for those businesses. The ones doing real work,
                  serving real customers — but losing leads because a call got missed,
                  or a form went nowhere, or there was no follow-up sequence in place.
                </p>
                <p>
                  We saw the gap. Most agencies sell websites and walk away. Most
                  "automation consultants" are too expensive or too theoretical. Local
                  businesses needed someone who could build the whole system — the page,
                  the capture, the CRM, the alert, the follow-up — and hand it over
                  as something they actually own and use.
                </p>
                <p>
                  That's A1 Creative. We build business operating infrastructure for
                  local brands that are ready to stop winging it and start running
                  like a real company.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-blue/20 bg-graphite p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue mb-6">
                Core Positioning
              </div>
              <blockquote className="text-2xl font-bold text-white leading-snug mb-6">
                "We build the business system behind the brand."
              </blockquote>
              <div className="divider mb-6" />
              <div className="space-y-3">
                {WHAT_SETS_APART.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-silver-dim">
                    <CheckIcon className="h-4 w-4 text-blue shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-graphite/20">
        <div className="container-x">
          <div className="mb-12">
            <span className="section-eyebrow">How We Operate</span>
            <h2 className="section-title max-w-2xl">
              The principles behind{' '}
              <span className="blue-text">every build.</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map(({ title, desc }) => (
              <div key={title} className="card p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1.5 w-6 rounded bg-blue" />
                  <h3 className="font-bold text-white">{title}</h3>
                </div>
                <p className="text-sm text-silver-dim leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="py-24 sm:py-32">
        <div className="container-x max-w-3xl mx-auto">
          <div className="rounded-xl border border-white/[0.06] bg-graphite p-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-silver-dim mb-5">
              Founder-Led
            </div>
            <p className="text-lg text-silver leading-relaxed mb-5">
              A1 Creative is a founder-led operation. Every system we propose, we've
              built ourselves. Every tool we recommend, we use internally. We don't
              outsource strategy or hand off the work to a junior who doesn't understand
              the client.
            </p>
            <p className="text-sm text-silver-dim leading-relaxed mb-5">
              When you work with A1 Creative, you're working with people who care about
              whether the system actually works — not just whether it looks good in a
              presentation.
            </p>
            <p className="text-sm text-silver-dim leading-relaxed">
              If you're a business owner who's tired of paying for things that don't
              move the needle, A1 Creative was built for you.
            </p>

            <div className="mt-8 pt-8 border-t border-white/[0.06] flex flex-wrap gap-4">
              <a href="https://a1creativeagency.com/quote" className="btn-primary">
                Work With Us <ArrowIcon className="h-4 w-4" />
              </a>
              <Link to="/infrastructure" className="btn-ghost">
                How We Build
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 pb-32 bg-graphite/20">
        <div className="container-x text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to build your system?
          </h2>
          <p className="text-silver-dim max-w-md mx-auto mb-8">
            Tell us about your business and where you're trying to go.
          </p>
          <a href="https://a1creativeagency.com/quote" className="btn-primary">
            Start Your Business System <ArrowIcon className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}
