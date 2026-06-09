/* A1 Creative — single source of truth for all live URLs and config. */
export const SITE = {
  name:    'A1 Creative',
  tagline: 'Build The Business System Behind Your Brand.',
  url:     'https://a1creativeagency.com',

  phoneDisplay: '(513) 440-3329',
  phoneTel:     'tel:+15134403329',

  email:     'operations@a1creativeagency.com',
  emailHref: 'mailto:operations@a1creativeagency.com',

  // Real Calendly — A1 Creative Agency Strategy Call (30 min outbound call)
  bookingUrl: 'https://calendly.com/admin-a1creativeagency/new-meeting',

  // Payment links — set Stripe payment link URLs here, then each package
  // card will automatically show a "Pay Deposit" button.
  // Leave as empty string ('') to hide the payment button on that package.
  //
  // To get these links:
  //   1. Go to dashboard.stripe.com → Payment Links → Create Link
  //   2. Create one link per package (e.g. "$750 deposit — Starter")
  //   3. Paste the https://buy.stripe.com/... URL below
  payment: {
    starter: '', // e.g. 'https://buy.stripe.com/xxx'
    growth:  '', // e.g. 'https://buy.stripe.com/yyy'
    vip:     '', // VIP → send to strategy call instead
  },

  social: {
    instagram: { name: '@a1creativeagency', href: 'https://www.instagram.com/a1creativeagency' },
    facebook:  { name: 'A1 Creative Agency', href: 'https://www.facebook.com/' },
    linkedin:  { name: 'A1 Creative',         href: 'https://www.linkedin.com/' },
  },
};
