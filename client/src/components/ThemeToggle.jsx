import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';

const ThemeToggle = ({ showLabel = false, className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* Primary Toggle Pill Button */}
      <div className="inline-flex items-center rounded-xl bg-slate-200/80 dark:bg-slate-800/90 p-0.5 border border-slate-300 dark:border-slate-700/80 shadow-sm transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-600">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="group relative flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {/* Icon with smooth rotate/scale transition */}
          <div className="relative w-4 h-4 flex items-center justify-center">
            {isDark ? (
              <Moon className="w-4 h-4 text-emerald-400 transition-transform duration-300 transform rotate-0 scale-100 group-hover:-rotate-12" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 transform rotate-0 scale-100 group-hover:rotate-45" />
            )}
          </div>

          {showLabel && (
            <span className="hidden sm:inline-block uppercase tracking-wider text-[11px]">
              {theme === 'system' ? 'System' : isDark ? 'Dark' : 'Light'}
            </span>
          )}
        </button>

        {/* Small Options Trigger for System / Explicit Mode */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Theme options"
          aria-haspopup="true"
          aria-expanded={isOpen}
          title="Choose theme (Light, Dark, System)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-36 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors ${
              theme === 'light'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors ${
              theme === 'dark'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dark</span>
            </div>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />}
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors ${
              theme === 'system'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>System</span>
            </div>
            {theme === 'system' && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
