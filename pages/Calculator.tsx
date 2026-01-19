import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCGPA, getSemesterOrderKey } from '../utils/gpa';
import { CgpaDial } from '../components/calculator/CgpaDial';
import { SemesterList } from '../components/calculator/SemesterList';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Download, LineChart, Search, Loader2, ArrowLeft, 
  History, Settings2, Sparkles, RefreshCcw, TrendingUp 
} from 'lucide-react';
import { 
  LineChart as RechartsLine, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Semester } from '../types';
import { fetchResults } from '../services/api';

export const Calculator = () => {
  const { activeProfile, setActiveProfile, saveProfile, isLoading, setIsLoading } = useApp();
  const navigate = useNavigate();
  const [showChart, setShowChart] = useState(false);
  const [regNum, setRegNum] = useState('');
  const [error, setError] = useState('');

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const profile = await fetchResults(regNum);
      if (profile) {
        saveProfile(profile);
        setRegNum('');
      } else {
        setError('Record not found. Use format: 2021-ag-1234');
      }
    } catch (err) {
      setError('UAF LMS Connection Failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddForecast = () => {
    if (!activeProfile) return;
    const newProfile = { ...activeProfile };
    let count = 1;
    while(newProfile.semesters[`Forecast ${count}`]) count++;
    const name = `Forecast ${count}`;
    
    newProfile.semesters[name] = {
        originalName: name,
        sortKey: getSemesterOrderKey(name),
        courses: [],
        gpa: 0, percentage: 0, totalCreditHours: 0, totalMarksObtained: 0, totalMaxMarks: 0, totalQualityPoints: 0,
        isForecast: true
    };
    saveProfile(newProfile);
  };

  const handleExportPDF = () => {
    if (!activeProfile) return;
    const summary = calculateCGPA(activeProfile);
    const doc = new jsPDF();
    
    doc.setFillColor(124, 58, 237); // Brand Purple
    doc.rect(0, 0, 210, 15, 'F');
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.text("Official Academic Transcript", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Student: ${activeProfile.studentInfo.name}`, 14, 45);
    doc.text(`Registration: ${activeProfile.studentInfo.registration}`, 14, 51);
    doc.text(`CGPA: ${summary.cgpa.toFixed(4)}`, 14, 57);

    let finalY = 70;
    (Object.values(activeProfile.semesters) as Semester[])
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .forEach(sem => {
        if(finalY > 260) { doc.addPage(); finalY = 20; }
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text(sem.originalName, 14, finalY);
        
        const tableBody = sem.courses.map(c => [c.code, c.title, c.creditHours, c.marks, c.grade]);
        autoTable(doc, {
            startY: finalY + 3,
            head: [['Code', 'Course Title', 'CH', 'Marks', 'Grade']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [124, 58, 237], fontSize: 9 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 }
        });
        finalY = (doc as any).lastAutoTable.finalY + 12;
      });

    doc.save(`${activeProfile.studentInfo.registration}_Transcript.pdf`);
  };

  // SEARCH VIEW (When no profile is active)
  if (!activeProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-600 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-2xl rotate-3">
            <Search size={32} />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Academic Workspace</h1>
            <p className="text-[13px] md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
              Ready to sync? Enter your registration number to retrieve your verified record from the UAF LMS server.
            </p>
          </div>
          
          <form onSubmit={handleFetch} className="relative w-full">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-2 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl focus-within:border-brand-500 transition-all">
              <input
                type="text"
                placeholder="e.g. 2021-ag-1234"
                value={regNum}
                onChange={(e) => setRegNum(e.target.value)}
                className="w-full bg-transparent border-none outline-none px-5 py-3 md:py-4 text-base md:text-xl font-black text-slate-900 dark:text-white placeholder-slate-300"
              />
              <Button type="submit" disabled={isLoading || !regNum} className="px-10 py-3 md:py-4 rounded-[1.25rem] md:rounded-[1.75rem] text-sm md:text-base font-black shrink-0 shadow-lg">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Fetch Record'}
              </Button>
            </div>
            {error && <p className="mt-4 text-red-500 font-bold text-xs bg-red-50 dark:bg-red-900/10 inline-block px-4 py-1.5 rounded-full">{error}</p>}
          </form>

          <div className="flex justify-center gap-3 pt-6">
             <Button variant="ghost" size="sm" onClick={() => navigate('/profiles')} className="text-slate-400 hover:text-brand-600 font-bold px-6 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
               <History className="w-4 h-4 mr-2" /> View Saved Profiles
             </Button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE DASHBOARD VIEW
  const summary = calculateCGPA(activeProfile);
  const chartData = (Object.values(activeProfile.semesters) as Semester[])
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(sem => ({
      name: sem.originalName.replace('Semester', '').trim(),
      gpa: sem.gpa
    }));

  return (
    <div className="pt-24 pb-28 px-4 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700">
      
      {/* PROFESSIONAL HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 md:gap-6 relative z-10">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 rotate-3">
             <Sparkles size={28} />
          </div>
          <div className="min-w-0">
              <h1 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white truncate">
                {activeProfile.studentInfo.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-lg text-[10px] md:text-xs font-black font-mono tracking-wider">
                  {activeProfile.studentInfo.registration}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                  Verified Result
                </span>
              </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto relative z-10">
            <Button variant="secondary" onClick={() => setShowChart(!showChart)} className="flex-1 lg:flex-none text-[11px] md:text-sm py-3 px-4 rounded-xl font-bold">
                <LineChart className="w-4 h-4 mr-2" /> Trend
            </Button>
            <Button variant="secondary" onClick={handleExportPDF} className="flex-1 lg:flex-none text-[11px] md:text-sm py-3 px-4 rounded-xl font-bold">
                <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button variant="primary" onClick={() => setActiveProfile(null)} className="flex-1 lg:flex-none text-[11px] md:text-sm py-3 px-4 rounded-xl font-bold">
                <RefreshCcw className="w-4 h-4 mr-2" /> New Search
            </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-10">
        {/* LEFT COLUMN: ANALYTICS */}
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <CgpaDial summary={summary} />
            
            {showChart && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 h-[320px] animate-in zoom-in-95">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance Over Time</h3>
                        <TrendingUp size={14} className="text-slate-400" />
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                        <RechartsLine data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                            <XAxis dataKey="name" hide />
                            <YAxis domain={[0, 4]} axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }} 
                              cursor={{ stroke: '#8b5cf6', strokeWidth: 1.5 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="gpa" 
                              stroke="#8b5cf6" 
                              strokeWidth={4} 
                              dot={{r:5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff'}} 
                              activeDot={{r:7}}
                            />
                        </RechartsLine>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="p-6 md:p-8 bg-brand-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="font-black text-lg mb-2">Goal Simulation</h3>
              <p className="text-white/70 text-xs leading-relaxed mb-6 font-medium">Add a virtual semester to analyze target marks and their impact on graduation standing.</p>
              <Button onClick={handleAddForecast} variant="secondary" className="w-full py-3.5 rounded-xl justify-between bg-white/10 border-white/20 text-white hover:bg-white hover:text-brand-600 transition-all font-black text-xs md:text-sm">
                  Add Forecast Semester
                  <Plus className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Workspace Utility</h3>
                <div className="space-y-1">
                   <ControlOption icon={<Settings2 size={16} />} label="Grade Settings" />
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: DETAILED DATA */}
        <div className="lg:col-span-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 px-1">
              Semester Log
              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 uppercase tracking-widest">
                {Object.keys(activeProfile.semesters).length} Terms Saved
              </span>
            </h2>
            <SemesterList profile={activeProfile} onUpdate={saveProfile} />
        </div>
      </div>
    </div>
  );
};

const ControlOption = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
        <div className="flex items-center gap-3">
           <div className="text-slate-400 group-hover:text-brand-600 transition-colors">{icon}</div>
           <span className="font-bold text-xs md:text-sm text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        <ArrowLeft className="w-3.5 h-3.5 text-slate-300 rotate-180 group-hover:translate-x-1 transition-transform" />
    </div>
);
