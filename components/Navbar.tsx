import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, GraduationCap, Home as HomeIcon, Calculator as CalcIcon, UserCircle, Info, ChevronRight, Sparkles, Globe, ShieldCheck, LayoutGrid } from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon, sub: 'Main Dashboard' },
    { name: 'Calculator', path: '/calculator', icon: CalcIcon, sub: 'GPA Engine' },
    { name: 'Profiles', path: '/profiles', icon: UserCircle, sub: 'Saved Records' },
    { name: 'About', path: '/about', icon: Info, sub: 'Developer Info' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 
        MAIN NAVBAR SHELL 
        Highest priority z-index to ensure visibility over all page content
      */}
      <nav className="fixed w-full z-[500] top-0 left-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-16 md:h-20 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 z-[600]">
            <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-500/20">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
              UAF <span className="text-brand-600 dark:text-brand-400">CGPA</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[10px] font-black uppercase tracking-widest transition-all relative ${
                  isActive(link.path)
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-brand-600 transition-all"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2 z-[600]">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-slate-900 dark:text-white focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={30} className="text-brand-600" /> : <Menu size={30} />}
            </button>
          </div>
        </div>
      </nav>

      {/* 
        PROFESSIONAL MOBILE OVERLAY
        Uses 'dvh' (Dynamic Viewport Height) to prevent clipping on mobile browsers
      */}
      <div className={`md:hidden fixed inset-0 z-[450] bg-white dark:bg-slate-950 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ height: '100dvh' }}>
        
        {/* Background Decorative elements (Non-transparent) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07] overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-full h-full bg-brand-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-full h-full bg-indigo-600 rounded-full blur-[120px]" />
        </div>

        <div className="h-full relative z-10 flex flex-col pt-24 pb-12 px-8 overflow-y-auto overscroll-contain">
          {/* Menu Header Context */}
          <div className={`mb-10 transition-all duration-700 delay-100 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-900/40 text-brand-700 dark:text-brand-300 font-black text-[10px] uppercase tracking-widest mb-4">
              <Sparkles size={12} />
              Navigation Hub
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Control <br />
              <span className="text-brand-600">Center.</span>
            </h2>
          </div>

          {/* Navigation Items (Action Cards) */}
          <div className="flex flex-col gap-3 mb-10">
            {navLinks.map((link, idx) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between p-5 rounded-[1.75rem] transition-all duration-500 border ${
                    active 
                      ? 'bg-brand-600 border-brand-500 text-white shadow-xl shadow-brand-500/20 translate-x-1' 
                      : 'bg-slate-50 dark:bg-slate-900/80 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  } ${
                    isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${150 + idx * 60}ms` }}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${
                      active ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'
                    }`}>
                      <link.icon size={22} strokeWidth={active ? 2.5 : 2} />
                    </div>
                    <div>
                      <span className={`block font-black text-lg tracking-tight ${active ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {link.name}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${active ? 'text-white/70' : 'text-slate-400'}`}>
                        {link.sub}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className={active ? 'opacity-100' : 'opacity-20'} />
                </Link>
              );
            })}
          </div>

          {/* Footer Context (Always visible at the bottom of the scrollable area) */}
          <div className={`mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 transition-all duration-1000 delay-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                 <Globe className="text-brand-600 mb-2" size={18} />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network</p>
                 <p className="text-[11px] font-bold text-slate-900 dark:text-white">UAF Verified</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                 <ShieldCheck className="text-emerald-500 mb-2" size={18} />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</p>
                 <p className="text-[11px] font-bold text-slate-900 dark:text-white">Encrypted</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">System Secure v2.1.0</span>
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                 © 2025 Handcrafted for UAF Students
               </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
