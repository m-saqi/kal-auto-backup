import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Trash2, User, Check, Plus, Calendar, BookOpen } from 'lucide-react';
import { Profile } from '../types';

export const Profiles = () => {
  const { savedProfiles, activeProfile, setActiveProfile, deleteProfile } = useApp();
  const navigate = useNavigate();
  const profiles: Profile[] = Object.values(savedProfiles);

  const handleSelect = (profile: Profile) => {
    setActiveProfile(profile);
    navigate('/calculator');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this profile?')) {
      deleteProfile(id);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Profiles</h1>
        <Button onClick={() => navigate('/')} variant="secondary" size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Search
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Profiles Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 mb-6">Fetch a result from the home page to save a profile.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              onClick={() => handleSelect(profile)}
              className={`group relative overflow-hidden p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                activeProfile?.id === profile.id 
                  ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/30 dark:bg-brand-900/10' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-800'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
                     activeProfile?.id === profile.id 
                     ? 'bg-brand-500 text-white' 
                     : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600'
                  }`}>
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                        {profile.studentInfo.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {profile.studentInfo.registration}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                    {activeProfile?.id === profile.id && (
                        <div className="bg-brand-500 text-white p-1 rounded-full">
                            <Check size={14} />
                        </div>
                    )}
                    <button 
                        onClick={(e) => handleDelete(e, profile.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Profile"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{Object.keys(profile.semesters).length} Semesters</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <BookOpen size={16} className="text-slate-400" />
                    <span>Last modified {new Date(profile.lastModified).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                    activeProfile?.id === profile.id 
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                    {activeProfile?.id === profile.id ? 'Active' : 'Saved'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};