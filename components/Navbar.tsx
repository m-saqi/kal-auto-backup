import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { theme, toggleTheme } = useApp();

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-brand-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-serif font-bold text-xl text-slate-900 dark:text-white">
            UAF <span className="text-brand-500">Calculator</span>
          </span>
        </Link>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
        </button>
      </div>
    </nav>
  );
};
