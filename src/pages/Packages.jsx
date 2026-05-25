import { Link } from 'react-router-dom';
import { ArrowIcon, CheckIcon } from '../components/icons.jsx';

const PACKAGES = [
  {
    tier: 'Starter',
    subtitle: 'Community Access System',
    price: 'Starting at $1,500',
    note: 'Community-access pricing. Not cheap pricing.',
    borderColor: 'border-white/[0.08]',
    accentColor: 'text-silver',
    badgeClass: '',
    badge: '',
    items: [
      { included: true, text: 'Website or landing page' },
      { included: true, text: 'Basic brand cleanup' },
      { included: true, text: 'Contact / intake form' },
      { included: true, text: 'QR code routing' },
      { included: true, text: 'Booking / contact bridge' },
      { included: true, text: 'Launch flyer / social graphic' },
      { included: true, text: 'Basic lead capture' },
      { included: true, text: '30-day light support' },
      { included: false, text: 'Airtable CRM setup' },
      { included: false, text: 'Twilio automation' },
      { included: false, text: 'Advanced follow-up flows' },
    ],
    cta: 'Start Starter Package',
    ctaClass: 'btn-ghost',
    description: 'The right foundation for businesses that need to establish a professional digital presence. A clean website, basic brand cleanup, lead capture, and QR routing — everything to look credible and start capturing leads.',
  },
  {
    tier: 'Growth',
    subtitle: 'Business Growth Infrastructure',
    price: 'Starting at $3,500',
    note: 'Most clients at this tier see immediate operational improvement.',
    borderColor: 'border-blue/40',
    accentColor: 'text-blue',
    badgeClass: 'bg-blue text-white',
    badge: 'Most Popular',
    items: [
      { included: true, text: 'Multi-page website' },
      { included: true, text: 'Airtable CRM setup' },
      { included: true, text: 'Lead pipeline and stages' },
      { included: true, text: 'Twilio text alert setup' },
      { included: true, text: 'Follow-up task automation' },
      { included: true, text: 'Booking flow integration' },
      { included: true, text: 'QR funnel system' },
      { included: true, text: 'Basic automation workflows' },
      { included: true, text: 'Review / follow-up flow' },
      { included: false, text: 'Full automation stack' },
      { included: false, text: 'Custom dashboard direction' },
    ],
    cta: 'Start Growth Package',
    ctaClass: 'btn-primary',
    description: 'For businesses that are operating but leaking leads and losing customers to disorganization. This is the full infrastructure layer — website, CRM, automation, booking, and follow-up — connected and working.',
  },
  {
    tier: 'VIP',
    subtitle: 'Full Infrastructure Build',
    price: 'Custom / Starting at $7,500',
    note: 'Built around your specific business, not a template.',
    borderColor: 'border-gold/40',
    accentColor: 'text-gold',
    badgeClass: 'bg-gold/20 text-gold border border-gold/30',
    badge: 'Custom Build',
    items: [
      { included: true, text: 'Full website system' },
      { included: true, text: 'CRM backend and configuration' },
      { included: true, text: 'Complete automation workflows' },
      { included: true, text: 'Missed-call recovery system' },
      { included: true, text: 'Customer journey setup' },
      { included: true, text: 'Dashboard direction and setup' },
      { included: true, text: 'Business operating system design' },
      { included: true, text: 'Deeper strategy and implementation' },
      { included: true, text: 'Full automation stack' },
      { included: true, text: 'Extended support and optimization' },
      { included: true, text: 'Team training and documentation' },
    ],
    cta: 'Apply for VIP Build',
    ctaClass: 'btn-gold',
    description: 'For established businesses ready for a complete operating system. This is a full infrastructure engagement — from website to CRM to automation to client journey. Built and configured for your specific business model.',
  },
];

const FAQ = [
  {
    q: 'What\'s included in "30-day light support"?',
    a: 'Minor copy updates, form adjustments, and technical fixes within the first 30 days after launch. It doesn\'t include new features or redesigns.',
  },
  {
    q: 'Can I start with Starter and upgrade?',
    a: 'Yes. Starter is designed to be a foundation. The infrastructure we build at that level is compatible with Growth upgrades — you\'re not starting over.',
  },
  {
    q: 'What is "community-access pricing"?',
    a: 'Starter pricing was designed to give local businesses access to professional infrastructure at a lower entry point. It\'s not cheap work — it\'s structured access.',
  },
  {
    q: 'How long does a build take?',
    a: 'Starter: 1–2 weeks. Growth: 3–5 weeks. VIP: 6–10 weeks depending on scope. Timeline begins after intake and deposit are complete.',
  },
  {
    q: 'Do I need to have a business already?',
    a: 'You should be operating or preparing to launch. A1 Creative builds infrastructure for businesses that have a real service and are ready to look and operate professionally.',
  },
  {
    q: 'What do I need to provide?',
    a: 'Business name, services, photos (if any), contact info, and any existing brand assets. We handle the rest during the intake process.',
  },
];

export default function Packages() {
  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-hero-gradient opacity-50" />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>
        <div className="container-x relative z-10 text-center">
          <span className="section-eyebrow">Investment</span>
          <h1 className="section-title max-w-3xl mx-auto">
            Systems priced for where{' '}
            <span className="blue-text">your business is going.</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-silver-dim leading-relaxed text-lg">
            Every package is a structured system build, not a freelance project.
            You get infrastructure — not just deliverables.
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="py-12 pb-24">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {PACKAGES.map(
              ({ tier, subtitle, price, note, borderColor, accentColor, badgeClass, badge, items, cta, ctaClass, description }) => (
                <div
                  key={tier}
                  className={`relative rounded-xl border ${borderColor} bg-graphite flex flex-col overflow-hidden`}
                >
                  {badge && (
                    <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                      <span className={`inline-block rounded px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${badgeClass}`}>
                        {badge}
                      </span>
                    </div>
                  )}

                  <div className="p-8 pb-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-silver-dim mb-1">
                      {subtitle}
                    </p>
                    <h2 className="text-3xl font-black text-white">{tier}</h2>
                    <p className={`mt-3 text-xl font-bold ${accentColor}`}>{price}</p>
                    <p className="mt-1 text-xs text-silver-dim italic">{note}</p>
                  </div>

                  <div className="p-8">
                    <p className="text-sm text-silver-dim leading-relaxed mb-6">{description}</p>

                    <div className="divider mb-6" />

                    <ul className="space-y-2.5">
                      {items.map(({ included, text }) => (
                        <li
                          key={text}
                          className={`flex items-start gap-2.5 text-sm ${
                            included ? 'text-silver' : 'text-silver-dark/60'
                          }`}
                        >
                          <span className={`mt-0.5 shrink-0 ${included ? 'text-blue' : 'text-silver-dark/40'}`}>
                            {included ? (
                              <CheckIcon className="h-4 w-4" />
                            ) : (
                              <span className="block h-4 w-4 flex items-center justify-center">
                                <span className="block h-0.5 w-3 bg-current rounded" />
                              </span>
                            )}
                          </span>
                          {text}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      <Link to="/contact" className={`${ctaClass} w-full text-center block`}>
                        {cta}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <p className="text-center text-xs text-silver-dark mt-8">
            All packages require an intake call and deposit to begin. Pricing may vary based on scope.{' '}
            <Link to="/contact" className="text-blue hover:underline">
              Contact us for a custom quote.
            </Link>
          </p>
        </div>
      </section>

      {/* What's NOT included */}
      <section className="py-20 bg-graphite/20">
        <div className="container-x max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">What we don't do</h2>
            <p className="mt-3 text-silver-dim">
              Transparency matters. Know what you're getting before you invest.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Cheap template websites',
              'Fake testimonials or results',
              'Empty marketing fluff',
              'Deliverables without outcomes',
              'Ongoing monthly retainers (unless agreed)',
              'Work without a signed agreement',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-silver-dim">
                <span className="h-1 w-4 rounded bg-silver-dark/40 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32">
        <div className="container-x max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-eyebrow">Common Questions</span>
            <h2 className="section-title">FAQ</h2>
          </div>

          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="card p-6">
                <h3 className="font-semibold text-white mb-2">{q}</h3>
                <p className="text-sm text-silver-dim leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/contact" className="btn-primary">
              Ready to Start? Let's Talk. <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
