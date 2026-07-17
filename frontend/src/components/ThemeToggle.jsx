import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme, resolvedTheme }) {
  return (
    <div className="flex items-center gap-1 border border-white/10 dark:border-white/5 rounded-2xl p-1 bg-white/5 backdrop-blur-md">
      {[
        { value: 'light', icon: <Sun className="w-3.5 h-3.5" /> },
        { value: 'dark', icon: <Moon className="w-3.5 h-3.5" /> },
        { value: 'system', icon: <Monitor className="w-3.5 h-3.5" /> }
      ].map((item) => (
        <button
          key={item.value}
          onClick={() => setTheme(item.value)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            theme === item.value 
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={`${item.value.charAt(0).toUpperCase() + item.value.slice(1)} Mode`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
