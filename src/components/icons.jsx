const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
};

export const SilkPressIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h9a4 4 0 0 1 0 8H7" />
    <path d="M4 4v6" />
    <path d="M7 15l-2 5" />
    <path d="M11 15l-1 5" />
    <circle cx="18" cy="6" r="1.4" />
  </svg>
);

export const WigIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 13a7 7 0 0 1 14 0v1H5z" />
    <path d="M5 14c-1 4-1 6 0 7M19 14c1 4 1 6 0 7" />
    <path d="M9 14c-.5 3-.5 5 0 7M15 14c.5 3 .5 5 0 7" />
  </svg>
);

export const CareIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 3c0 4-4 5-4 9a7 7 0 0 0 14 0c0-2-1-3-2-4" />
    <path d="M12 12c0-3 2-4 4-5" />
  </svg>
);

export const StylingIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="7" cy="6" r="2.4" />
    <circle cx="7" cy="18" r="2.4" />
    <path d="M9 7l11 10M9 17L20 7" />
  </svg>
);

export const TreatmentIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <circle cx="17.5" cy="17.5" r="2.5" />
    <path d="M6 18h4" />
  </svg>
);

export const CollectionIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="6" y="9" width="5" height="12" rx="1.4" />
    <rect x="13" y="6" width="5" height="15" rx="1.4" />
    <path d="M7.5 9V7.5a1 1 0 0 1 2 0V9M14.5 6V4.5a1 1 0 0 1 2 0V6" />
  </svg>
);

export const ArrowIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const PhoneIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />
  </svg>
);

export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

export const InstagramIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const FacebookIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2.2l.8-3H14V8.5c0-.4.3-.5.6-.5z" />
  </svg>
);

export const MapPinIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
