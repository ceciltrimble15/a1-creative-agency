/* Single source of truth for live business + contact details. */
export const SITE = {
  name: 'TRHUE Hair Care',
  tagline: 'Beauty. Care. Confidence.',
  url: 'https://www.trhuehaircare.com',

  phoneDisplay: '(513) 822-3929',
  phoneTel: 'tel:+15138223929',
  phoneSms: 'sms:+15138223929',

  email: 'info@trhuehaircare.com',
  emailHref: 'mailto:info@trhuehaircare.com',

  address: {
    street: '4209 Glenway Ave',
    cityState: 'Cincinnati, OH 45205',
    full: '4209 Glenway Ave, Cincinnati, OH 45205',
  },
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=4209+Glenway+Ave+Cincinnati+OH+45205',

  social: {
    instagram: { name: 'Shawnece Hughes', href: 'https://www.instagram.com/' },
    facebook: { name: 'Shawnece Pretty Watson', href: 'https://www.facebook.com/' },
  },

  hours: [
    { day: 'Monday – Saturday', value: 'By Appointment' },
    { day: 'Sunday', value: 'Closed' },
  ],
};
