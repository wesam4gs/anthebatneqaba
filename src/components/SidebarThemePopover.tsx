import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { useLanguageTheme, SidebarThemePreset } from '../context/LanguageThemeContext';

interface SidebarThemePopoverProps {
 buttonClassName?: string;
}

export const SidebarThemePopover: React.FC<SidebarThemePopoverProps> = ({ buttonClassName }) => {
 const [isOpen, setIsOpen] = useState(false);
 const { lang, sidebarTheme, setSidebarTheme, sidebarThemePresets } = useLanguageTheme();
 const popoverRef = useRef<HTMLDivElement>(null);
 const buttonRef = useRef<HTMLButtonElement>(null);

 // Close when clicking outside
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (
 popoverRef.current && 
 !popoverRef.current.contains(event.target as Node) &&
 buttonRef.current &&
 !buttonRef.current.contains(event.target as Node)
 ) {
 setIsOpen(false);
 }
 };

 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside);
 }
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
 }, [isOpen]);

 // Handle escape key
 useEffect(() => {
 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key === 'Escape' && isOpen) {
 setIsOpen(false);
 }
 };

 if (isOpen) {
 document.addEventListener('keydown', handleKeyDown);
 }
 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 };
 }, [isOpen]);

 const handleSelectTheme = (preset: SidebarThemePreset) => {
 setSidebarTheme(preset.id);
 setIsOpen(false);
 };

 return (
 <div className="relative inline-block" ref={popoverRef}>
 {/* Design / Theme Icon Button in Sidebar */}
 <button
 ref={buttonRef}
 id="sidebar-theme-trigger-btn"
 type="button"
 onClick={() => setIsOpen(!isOpen)}
 className={buttonClassName || "p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800/80 transition cursor-pointer relative group"}
 title={lang === 'ar' ? 'تصميم الشريط الجانبي (7 تصاميم)' : 'Sidebar Theme (7 designs)'}
 aria-label="Sidebar design selector"
 aria-expanded={isOpen}
 >
 <Palette className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
 </button>

 {/* Popover Menu positioned upward from sidebar footer */}
 {isOpen && (
 <div
 id="sidebar-theme-popover-panel"
 className={`absolute bottom-full mb-2 z-50 w-56 p-3 bg-slate-900/98 text-slate-100 rounded-2xl border border-slate-700/90 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
 lang === 'ar' ? 'right-0' : 'left-0'
 }`}
 role="dialog"
 aria-label="قائمة تصاميم الشريط الجانبي"
 >
 {/* Header */}
 <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
 <div className="flex items-center gap-1.5">
 <Palette className="w-3.5 h-3.5 text-amber-400" />
 <h3 className="text-xs font-bold text-white">
 {lang === 'ar' ? 'تصميم الشريط' : 'Sidebar Theme'}
 </h3>
 </div>
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
 title="إغلاق"
 >
 <X className="w-3 h-3" />
 </button>
 </div>

 {/* 7 Sidebar Themes (One-word each) */}
 <div className="space-y-1.5" id="sidebar-theme-list">
 {sidebarThemePresets.map((preset) => {
 const isSelected = preset.id === sidebarTheme;

 return (
 <button
 key={preset.id}
 type="button"
 onClick={() => handleSelectTheme(preset)}
 className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-bold ${
 isSelected
 ? 'bg-amber-500/20 text-amber-300 border-amber-400 ring-1 ring-amber-400/40 shadow-xs'
 : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-200'
 }`}
 >
 <div className="flex items-center gap-2">
 <span className="text-base leading-none">{preset.icon}</span>
 <span>{lang === 'ar' ? preset.nameAr : preset.nameEn}</span>
 </div>

 <div className="flex items-center gap-1.5">
 <span
 className="w-3 h-3 rounded-full border border-slate-600 shrink-0 shadow-xs"
 style={{ backgroundColor: preset.bg }}
 />
 {isSelected ? (
 <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3] shrink-0" />
 ) : (
 <div className="w-3.5 h-3.5" />
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
