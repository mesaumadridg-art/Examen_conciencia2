import React from 'react';

interface AppIconProps {
  iconId?: string; // Kept optional for backward compatibility
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AppIcon: React.FC<AppIconProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 shadow-lg border border-[#C9A227]/40 ring-1 ring-[#C9A227]/20 bg-[#0B0914] ${sizeClasses} ${className}`}
      title="Examen de Conciencia"
    >
      <img
        src="/src/assets/images/catholic_icon_pure_1791774627020.jpg"
        alt="Examen de Conciencia"
        className="w-full h-full object-cover scale-[1.02]"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};
