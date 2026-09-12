import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Check, 
  X, 
  Sparkles, 
  Sun, 
  Moon, 
  Eye, 
  ShieldCheck 
} from 'lucide-react';
import { useLanguageTheme, MedicalThemeId, MedicalThemePreset } from '../context/LanguageThemeContext';

interface ThemeSelectorPopoverProps {
  onThemeChanged?: (theme: MedicalThemePreset) => void;
  compact?: boolean;
}

export const ThemeSelectorPopover: React.FC<ThemeSelectorPopoverProps> = ({
  onThemeChanged,
  compact = false
}) => {
  const { 
    lang, 
    medicalTheme, 
    setMedicalTheme, 
    medicalThemePresets, 
    currentThemePreset,
    theme 
  } = useLanguageTheme();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (preset: MedicalThemePreset) => {
    setMedicalTheme(preset.id);
    if (onThemeChanged) {
      onThemeChanged(preset);
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Topbar Trigger Button */}
      <button
        ref={buttonRef}
        id="themeToggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs relative group ${
          isOpen
            ? 'bg-amber-500/20 text-amber-300 border-amber-400 ring-2 ring-amber-400/30'
            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
        }`}
        title={lang === 'ar' ? 'تصميم الموقع (7 تصاميم)' : 'Site Theme'}
        aria-label="Theme selector menu"
        aria-expanded={isOpen}
      >
        <div className="relative flex items-center justify-center">
          <Palette className="w-3.5 h-3.5 text-amber-400 transition-transform group-hover:scale-110" />
          <span 
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-slate-900 shadow-xs"
            style={{ backgroundColor: currentThemePreset.colors.primary }}
          />
        </div>

        <span className="text-xs font-bold text-slate-200">
          {lang === 'ar' ? currentThemePreset.nameAr : currentThemePreset.nameEn}
        </span>
      </button>

      {/* Floating Theme Selector Dropdown Popover */}
      {isOpen && (
        <div 
          id="theme-selector-popover-panel"
          className={`absolute top-full mt-2 z-50 w-64 p-3 bg-slate-900/98 text-slate-100 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            lang === 'ar' ? 'left-0 sm:-left-6' : 'right-0 sm:-right-6'
          }`}
          role="dialog"
          aria-label="قائمة اختيار التصاميم"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white">
                {lang === 'ar' ? 'تصميم الموقع' : 'Site Theme'}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme List: 7 Calm Medical Presets - Shortened to 1 Word */}
          <div className="space-y-1.5" id="site-theme-list">
            {medicalThemePresets.map((preset) => {
              const isSelected = preset.id === medicalTheme;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectTheme(preset)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer select-none text-xs font-bold ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-xs ring-1 ring-amber-400/40'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none shrink-0">{preset.icon}</span>
                    <span>{lang === 'ar' ? preset.nameAr : preset.nameEn}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0 shadow-xs" 
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    {isSelected ? (
                      <Check className="w-4 h-4 text-amber-400 stroke-[3] shrink-0" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
