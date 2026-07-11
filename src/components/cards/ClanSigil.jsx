import React from 'react';
import { CLAN_COLORS } from '@/lib/cardData';

// Elegant SVG sigils for each clan — hand-crafted geometric / heraldic symbols.
// Rendered as inline SVG so they scale perfectly and look great at any size.

const SIGILS = {
  Guerreros: ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* crossed swords */}
      <line x1="8" y1="8" x2="32" y2="32" stroke={color} strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="32" y1="8" x2="8" y2="32" stroke={color} strokeWidth="3.5" strokeLinecap="round"/>
      {/* guard crossguards */}
      <line x1="5" y1="14" x2="14" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="35" y1="14" x2="26" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* pommels */}
      <circle cx="7" cy="33" r="2.5" fill={color}/>
      <circle cx="33" cy="33" r="2.5" fill={color}/>
    </svg>
  ),

  Druidas: ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* triple leaf / triquetra */}
      <path d="M20 5 C20 5 28 10 28 20 C28 28 22 32 20 35 C18 32 12 28 12 20 C12 10 20 5 20 5Z" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M20 35 C20 35 8 30 6 20 C4 11 10 6 14 6 C11 12 12 18 20 22 C20 22 28 18 26 12 C28 6 34 11 34 20 C32 30 20 35 20 35Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.18"/>
      <circle cx="20" cy="20" r="3" fill={color}/>
    </svg>
  ),

  'No-muertos': ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* skull outline */}
      <path d="M20 6 C12 6 8 12 8 18 C8 23 11 26 13 28 L13 33 L27 33 L27 28 C29 26 32 23 32 18 C32 12 28 6 20 6Z" stroke={color} strokeWidth="2.2" fill="none"/>
      {/* teeth */}
      <line x1="14" y1="33" x2="14" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="18" y1="33" x2="18" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="33" x2="22" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="33" x2="26" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* eyes */}
      <ellipse cx="15.5" cy="20" rx="3" ry="3.5" fill={color}/>
      <ellipse cx="24.5" cy="20" rx="3" ry="3.5" fill={color}/>
      {/* nose */}
      <path d="M19 25 L21 25 L20 27 Z" fill={color} opacity="0.7"/>
    </svg>
  ),

  Vaqueros: ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* sheriff star (6-pointed) */}
      <polygon points="20,4 23.5,14 34,14 25.5,20.5 28.5,31 20,25 11.5,31 14.5,20.5 6,14 16.5,14" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      <circle cx="20" cy="20" r="4" fill={color} opacity="0.85"/>
    </svg>
  ),

  Elfos: ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* bow */}
      <path d="M12 5 C6 14 6 26 12 35" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* string */}
      <line x1="12" y1="5" x2="12" y2="35" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2"/>
      {/* arrow shaft */}
      <line x1="13" y1="20" x2="35" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* arrowhead */}
      <polygon points="35,20 30,17 30,23" fill={color}/>
      {/* fletching */}
      <path d="M14 20 L10 16 M14 20 L10 24" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  Magos: ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 8-pointed arcane star */}
      <polygon points="20,5 22,17 34,20 22,23 20,35 18,23 6,20 18,17" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15" strokeLinejoin="round"/>
      <polygon points="20,10 21,17.5 28.5,20 21,22.5 20,30 19,22.5 11.5,20 19,17.5" fill={color} fillOpacity="0.35"/>
      <circle cx="20" cy="20" r="3.5" fill={color}/>
    </svg>
  ),

  Épicas: ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* diamond / gem */}
      <polygon points="20,4 34,16 20,36 6,16" stroke={color} strokeWidth="2.2" fill={color} fillOpacity="0.15" strokeLinejoin="round"/>
      {/* facets */}
      <line x1="6" y1="16" x2="34" y2="16" stroke={color} strokeWidth="1.4"/>
      <line x1="20" y1="4" x2="6" y2="16" stroke={color} strokeWidth="1.4"/>
      <line x1="20" y1="4" x2="34" y2="16" stroke={color} strokeWidth="1.4"/>
      <line x1="6" y1="16" x2="20" y2="36" stroke={color} strokeWidth="1.4"/>
      <line x1="34" y1="16" x2="20" y2="36" stroke={color} strokeWidth="1.4"/>
      <line x1="20" y1="4" x2="20" y2="36" stroke={color} strokeWidth="1" opacity="0.4"/>
    </svg>
  ),

  Cotidianos: ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* comedy / tragedy masks suggestion — two overlapping circles */}
      <circle cx="15" cy="19" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1"/>
      <circle cx="25" cy="21" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1"/>
      {/* smiling arc on left */}
      <path d="M11 22 Q15 26 19 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* sad arc on right */}
      <path d="M21 26 Q25 22 29 26" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* eyes */}
      <circle cx="13" cy="17" r="1.5" fill={color}/>
      <circle cx="17" cy="17" r="1.5" fill={color}/>
      <circle cx="23" cy="19" r="1.5" fill={color}/>
      <circle cx="27" cy="19" r="1.5" fill={color}/>
    </svg>
  ),

  Bizarros: ({ color }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Emblema exclusivo: ojo del caos con pupila espiral y rayos asimétricos */}
      <path d="M4 20 C10 9 29 7 36 20 C29 33 10 31 4 20Z" stroke={color} strokeWidth="2.2" fill={color} fillOpacity="0.12"/>
      <path d="M20 12 C28 12 29 22 23 26 C17 30 11 24 14 18 C16 14 22 14 24 18 C26 22 21 25 18 23 C15 21 17 18 20 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 9 L12 13 M30 7 L28 12 M35 29 L30 26 M11 33 L14 28" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="2.2" fill={color}/>
    </svg>
  ),
};

// Default fallback
const DefaultSigil = ({ color }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="20,4 36,36 4,36" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
  </svg>
);

export default function ClanSigil({ clan, size = 40, className = '', color: colorOverride }) {
  const color = colorOverride || CLAN_COLORS[clan] || '#caa14a';
  const SigilComponent = SIGILS[clan] || DefaultSigil;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={clan}
    >
      <SigilComponent color={color} />
    </span>
  );
}