import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '../types';
import { calculateCGPA } from '../utils/gpa';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  savedProfiles: Record<string, Profile>;
  saveProfile: (profile: Profile) => void;
  deleteProfile: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load theme and profiles from local storage
  useEffect(() => {
    const storedTheme = localStorage.getItem('uaf-theme') as 'light' | 'dark';
    if (storedTheme) setTheme(storedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');

    const storedProfiles = localStorage.getItem('uafCalculatorProfiles_v2');
    if (storedProfiles) {
      setSavedProfiles(JSON.parse(storedProfiles));
    }
  }, []);

  // Update DOM class for theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('uaf-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const saveProfile = (profile: Profile) => {
    // Re-calculate stats before saving to ensure consistency
    calculateCGPA(profile); 
    const updatedProfiles = { ...savedProfiles, [profile.id]: profile };
    setSavedProfiles(updatedProfiles);
    setActiveProfile(profile);
    localStorage.setItem('uafCalculatorProfiles_v2', JSON.stringify(updatedProfiles));
  };

  const deleteProfile = (id: string) => {
    const updated = { ...savedProfiles };
    delete updated[id];
    setSavedProfiles(updated);
    localStorage.setItem('uafCalculatorProfiles_v2', JSON.stringify(updated));
    if (activeProfile?.id === id) setActiveProfile(null);
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      activeProfile, setActiveProfile,
      savedProfiles, saveProfile, deleteProfile,
      isLoading, setIsLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
