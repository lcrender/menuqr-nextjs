type IconName =
  | 'dish'
  | 'price'
  | 'image'
  | 'categories'
  | 'text'
  | 'toggle'
  | 'check'
  | 'qr'
  | 'arrow';

type Props = {
  name: IconName;
  className?: string;
};

/** Iconos SVG simples para la landing de funciones (sin emojis). */
export default function FxIcon({ name, className = '' }: Props) {
  const common = {
    className: `fx-icon ${className}`.trim(),
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'dish':
      return (
        <svg {...common}>
          <path d="M4 12h16" />
          <path d="M5 12a7 7 0 0 1 14 0" />
          <path d="M12 5v2" />
        </svg>
      );
    case 'price':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M9.5 9.5c.5-1 1.5-1.5 2.5-1.5s2 .6 2 1.75-1 1.5-2.5 2-2.5.9-2.5 2.25 1.2 1.75 2.5 1.75 2-.5 2.5-1.5" />
        </svg>
      );
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m21 15-4.5-4.5L7 20" />
        </svg>
      );
    case 'categories':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h10M4 18h14" />
        </svg>
      );
    case 'text':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h12M4 18h8" />
        </svg>
      );
    case 'toggle':
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="8" rx="4" />
          <circle cx="15" cy="12" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case 'qr':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="7" height="7" rx="1" />
          <rect x="13" y="4" width="7" height="7" rx="1" />
          <rect x="4" y="13" width="7" height="7" rx="1" />
          <path d="M13 13h3v3h-3zM18 13h2v2M13 18h2v2M17 17h3v3" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    default:
      return null;
  }
}
