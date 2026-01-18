import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, GraduationCap, Github, Linkedin, Twitter, Mail, ExternalLink } from 'lucide-react';

interface FooterSectionProps {
  title: string;
  links: { name: string; path: string; external?: boolean }[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 md:border-none">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-5 md:py-0 md:mb-6 text-left focus:outline-none group transition-all duration-300 ${
          isOpen ? 'bg-slate-50/50 dark:bg-slate-800/30 px-2 -mx-2 rounded-xl' : ''
        }`}
      >
        <h3 className={`text-sm font-bold uppercase tracking-widest transition-colors duration-300 ${
          isOpen ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'
        }`}>
          {title}
        </h3>
        <div className={`p-1 rounded-full transition-all duration-300 md:hidden ${
          isOpen ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600' : 'text-slate-400'
        }`}>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:max-h-none ${
          isOpen ? 'max-h-[400px] opacity-100 mb-4' : 'max-h-0 opacity-0 md:opacity-100'
        }`}
      >
        <ul className="space-y-3 pl-1 md:pl-0 border-l-2 border-transparent md:border-none transition-all duration-300">
          {links.map((link) => (
            <li key={link.name} className="translate-x-0">
              {link.external ? (
                <a 
                  href={link.path} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group/link text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 text-[13px] md:text-sm font-medium transition-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover/link:bg-brand-500 transition-colors md:hidden"></span>
                  {link.name} 
                  <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-50 transition-opacity" />
                </a>
              ) : (
                <Link 
                  to={link.path}
                  className="group/link text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 text-[13px] md:text-sm font-medium transition-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover/link:bg-brand-500 transition-colors md:hidden"></span>
                  {link.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const Footer = () => {
  const sections = [
    {
      title: "Navigation",
      links: [
        { name: "Home / Search", path: "/" },
        { name: "GPA Calculator", path: "/calculator" },
        { name: "Saved Profiles", path: "/profiles" },
        { name: "About Developer", path: "/about" },
      ]
    },
    {
      title: "Academic Tools",
      links: [
        { name: "UAF LMS", path: "https://lms.uaf.edu.pk", external: true },
        { name: "Result Portal", path: "https://uaf.edu.pk/results", external: true },
        { name: "Date Sheet", path: "https://uaf.edu.pk/datesheets", external: true },
        { name: "Forecast Tool", path: "/calculator" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Report Issue", path: "mailto:saqlain@example.com", external: true },
        { name: "GitHub Repo", path: "https://github.com/m-saqi", external: true },
        { name: "LinkedIn", path: "https://www.linkedin.com/in/muhammad-saqlain-akbar/", external: true },
        { name: "Privacy Policy", path: "/about" },
      ]
    }
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-36 md:pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          <div className="md:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-brand-600 p-2.5 rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-brand-500/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                UAF <span className="text-brand-600">CGPA</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              The most accurate and modern academic tool for University of Agriculture Faisalabad students. 
              Built for precision, speed, and privacy.
            </p>
            <div className="flex items-center gap-3">
              <SocialIcon href="https://github.com/m-saqi" icon={<Github size={18} />} />
              <SocialIcon href="https://linkedin.com" icon={<Linkedin size={18} />} />
              <SocialIcon href="https://twitter.com" icon={<Twitter size={18} />} />
              <SocialIcon href="mailto:saqlain@example.com" icon={<Mail size={18} />} />
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-y-2 md:gap-8">
            {sections.map((section) => (
              <FooterSection key={section.title} title={section.title} links={section.links} />
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <p className="text-center md:text-left">© 2025 UAF CGPA Calculator • Handcrafted by M Saqlain</p>
          <div className="flex gap-8 items-center">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Operational
            </span>
            <span className="hover:text-brand-600 cursor-pointer transition-colors">v2.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a 
    href={href} 
    target="_blank"
    rel="noopener noreferrer"
    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 hover:text-white hover:bg-brand-600 dark:hover:bg-brand-600 transition-all duration-300"
  >
    {icon}
  </a>
);