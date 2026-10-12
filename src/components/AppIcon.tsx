import React from 'react';

interface AppIconProps {
  iconId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AppIcon: React.FC<AppIconProps> = ({ iconId = 'icon_1', className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }[size];

  if (iconId === 'icon_2') {
    // Sagrado Corazón de Misericordia
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#2D0A14] via-[#1A050B] to-[#0A0205] p-2 border border-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.2)] ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Divine Rays */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="#C9A227" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" stroke="#C9A227" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          {/* Heart Shape */}
          <path d="M50 82 C20 60 15 38 32 26 C42 18 50 28 50 28 C50 28 58 18 68 26 C85 38 80 60 50 82 Z" fill="url(#burgundy-heart-grad)" stroke="#C9A227" strokeWidth="2" />
          {/* Flame on Top */}
          <path d="M46 22 C44 14 50 8 50 8 C50 8 56 14 54 22 Z" fill="#FFD700" opacity="0.9" />
          {/* Small Cross atop Heart */}
          <path d="M50 12 L50 24 M44 16 L56 16" stroke="#FFE899" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="burgundy-heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9B111E" />
              <stop offset="100%" stopColor="#4A000B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (iconId === 'icon_3') {
    // Estola Confesional & Chi-Rho
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A0B2E] via-[#0F061D] to-[#080210] p-2 border border-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.2)] ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stole Ribbons */}
          <path d="M30 15 L45 85 M70 15 L55 85" stroke="#7E22CE" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
          {/* Chi Rho (XP) */}
          <path d="M50 15 L50 85" stroke="#FFE899" strokeWidth="5" strokeLinecap="round" />
          <path d="M50 20 C68 20 68 45 50 45" fill="none" stroke="#FFE899" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 30 L68 70 M68 30 L32 70" stroke="#C9A227" strokeWidth="4" strokeLinecap="round" />
          {/* Golden Crosses */}
          <path d="M45 74 L45 84 M41 78 L49 78" stroke="#FFE899" strokeWidth="2" />
          <path d="M55 74 L55 84 M51 78 L59 78" stroke="#FFE899" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // Default: icon_1 (Cruz y Paloma de la Paz)
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#141415] via-[#1C1A17] to-[#0A0A0A] p-2 border border-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.2)] ${sizeClasses} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Divine Halo */}
        <circle cx="50" cy="45" r="32" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
        <circle cx="50" cy="45" r="24" fill="none" stroke="#FFE899" strokeWidth="1" opacity="0.4" />
        {/* Golden Cross */}
        <path d="M50 12 L50 82 M26 35 L74 35" stroke="#C9A227" strokeWidth="7" strokeLinecap="round" />
        <path d="M50 14 L50 80 M28 35 L72 35" stroke="#FFE899" strokeWidth="3" strokeLinecap="round" />
        {/* Holy Dove */}
        <path d="M50 50 C45 42 35 40 28 44 C35 50 42 52 48 56 C52 52 62 48 72 44 C65 40 55 42 50 50 Z" fill="#FFFFFF" opacity="0.95" />
        <circle cx="49" cy="48" r="1.5" fill="#C9A227" />
      </svg>
    </div>
  );
};
