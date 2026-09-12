import React from 'react';

interface SyndicateLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  altText?: string;
  lightText?: boolean;
}

export const SyndicateLogo: React.FC<SyndicateLogoProps> = ({
  className = "w-16 h-16",
  size,
  showText = false,
  altText = "جمهورية العراق - نقابة التمريض العراقية - شعار النقابة",
  lightText = false
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? '' : 'justify-center'}`}>
      <img
        src="/logo.png"
        alt={altText}
        className={`${className} object-contain shrink-0 rounded-full bg-[var(--theme-card-bg)]`}
        style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
        referrerPolicy="no-referrer"
      />
      {showText && (
        <div className="text-right leading-tight select-none">
          <span className="block text-[11px] font-extrabold text-amber-500 tracking-wide">جمهورية العراق</span>
          <h1 className={`font-black text-sm leading-snug ${lightText ? 'text-white' : 'text-[var(--theme-text-primary)]'}`}>نقابة التمريض العراقية</h1>
        </div>
      )}
    </div>
  );
};
