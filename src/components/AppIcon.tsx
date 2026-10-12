import React, { useState } from 'react';

interface AppIconProps {
  iconId?: string; // Kept optional for backward compatibility
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AppIcon: React.FC<AppIconProps> = ({ className = '', size = 'md' }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 shadow-md border border-[#C9A227]/40 ring-1 ring-[#C9A227]/20 bg-[#0B0914] ${sizeClasses} ${className}`}
      title="Examen de Conciencia"
    >
      {!hasError ? (
        <img
          src="/icon-192.png"
          srcSet="/icon-192.png 1x, /icon-512.png 2x"
          alt="Examen de Conciencia"
          className="w-full h-full object-cover scale-[1.02]"
          loading="eager"
          decoding="async"
          onError={() => setHasError(true)}
        />
      ) : (
        /* Fallback SVG icon if network or browser fails */
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#141415" stroke="#C9A227" strokeWidth="2" />
          <path d="M50 16 V84 M28 38 H72" stroke="#C9A227" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="38" r="7" fill="#8B0000" stroke="#FFE899" strokeWidth="2" />
          <circle cx="50" cy="38" r="3" fill="#FFE899" />
        </svg>
      )}
    </div>
  );
};
