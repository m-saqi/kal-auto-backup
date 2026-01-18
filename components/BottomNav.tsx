import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calculator, UserCircle, Info } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Calc', path: '/calculator', icon: Calculator },
    { name: 'Profiles', path: '/profiles', icon: UserCircle },
    { name: 'About', path: '/about', icon: Info },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[50] px-6 pb-6 pt-2">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl dark:shadow-[0_-8px_30px_rgb(0,0,0,0.3)] rounded-[2rem] flex justify-around items-center h-16 px-2 relative overflow-hidden">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                active 
                ? 'text-brand-600 dark:text-brand-400 scale-110' 
                : 'text-slate-400 dark:text-slate-500'
              }`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              
              <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${
                active 
                ? 'text-brand-600 dark:text-brand-400 opacity-100 translate-y-0' 
                : 'text-slate-400 dark:text-slate-500 opacity-0 translate-y-1'
              }`}>
                {item.name}
              </span>

              {active && (
                <div className="absolute top-0 w-8 h-1 bg-brand-600 dark:bg-brand-400 rounded-full shadow-[0_0_12px_#8b5cf6]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
