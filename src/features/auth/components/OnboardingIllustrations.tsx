import React from 'react';

/**
 * Illustrations d'onboarding — géométriques et minimalistes, dessinées en
 * SVG inline (aucune dépendance externe), sur la palette de marque
 * Confort+ (bleu nuit / vert profond).
 */

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 280 280" className="h-full w-full" role="img" aria-hidden="true">
    <circle cx="140" cy="140" r="132" fill="#F2F6FC" />
    {children}
  </svg>
);

export const MoveFreelyIllustration: React.FC = () => (
  <Frame>
    <path d="M20 190 Q140 120 260 190" stroke="#C3D5EC" strokeWidth="14" strokeLinecap="round" fill="none" />
    <path d="M20 190 Q140 120 260 190" stroke="#0F2A4D" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" fill="none" />
    <g transform="translate(96 122)">
      <rect x="0" y="26" width="88" height="34" rx="12" fill="#0F2A4D" />
      <path d="M12 26 L26 6 H62 L76 26 Z" fill="#0F2A4D" />
      <path d="M18 26 L28 12 H58 L68 26 Z" fill="#5B8AC4" />
      <circle cx="22" cy="60" r="12" fill="#10151C" />
      <circle cx="22" cy="60" r="5" fill="#F2F6FC" />
      <circle cx="66" cy="60" r="12" fill="#10151C" />
      <circle cx="66" cy="60" r="5" fill="#F2F6FC" />
    </g>
    <circle cx="60" cy="70" r="6" fill="#1B6854" />
    <circle cx="222" cy="86" r="9" fill="#1B6854" opacity="0.6" />
    <circle cx="236" cy="60" r="5" fill="#0F2A4D" opacity="0.4" />
  </Frame>
);

export const TrackRideIllustration: React.FC = () => (
  <Frame>
    <rect x="60" y="46" width="160" height="188" rx="24" fill="#FFFFFF" stroke="#E4E8ED" strokeWidth="2" />
    <path d="M84 180 C 110 120, 150 150, 176 96" stroke="#C3D5EC" strokeWidth="8" strokeLinecap="round" fill="none" />
    <path d="M84 180 C 110 120, 150 150, 176 96" stroke="#0F2A4D" strokeWidth="2.5" strokeDasharray="1 10" strokeLinecap="round" fill="none" />
    <circle cx="84" cy="180" r="6" fill="#0F2A4D" />
    <circle cx="176" cy="96" r="7" fill="#1B6854" />
    <circle cx="176" cy="96" r="14" fill="#1B6854" opacity="0.18" />
    <circle cx="176" cy="96" r="22" fill="#1B6854" opacity="0.1" />
    <rect x="76" y="200" width="128" height="20" rx="10" fill="#F1F9F5" />
    <rect x="86" y="207" width="60" height="6" rx="3" fill="#1B6854" />
  </Frame>
);

export const PaySecurelyIllustration: React.FC = () => (
  <Frame>
    <rect x="62" y="96" width="156" height="102" rx="18" fill="#0F2A4D" />
    <rect x="62" y="122" width="156" height="18" fill="#0E3B2E" />
    <rect x="82" y="162" width="52" height="10" rx="5" fill="#5B8AC4" />
    <circle cx="180" cy="167" r="12" fill="#4FA68C" />
    <g transform="translate(150 44)">
      <circle cx="30" cy="30" r="30" fill="#1B6854" />
      <path d="M18 30 L27 39 L43 20" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  </Frame>
);
