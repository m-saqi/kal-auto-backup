import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCGPA } from '../utils/gpa';
import { CgpaDial } from '../components/calculator/CgpaDial';
import { SemesterList } from '../components/calculator/SemesterList';
import { Button } from '../components/ui/Button';
import { 
  Download, Search, Loader2, RefreshCcw, Lock, PlusCircle, Activity 
} from 'lucide-react';
import { fetchResults } from '../services/api';
import { jsPDF } from 'jspdf';

const RESTRICTED_MAP: Record<string, string> = {
    '2020-ag-9423': 'am9rZXI5MTE=', 
    '2019-ag-8136': 'bWlzczkxMQ=='
};

const BED_COURSES = new Set(['EDU-501', 'EDU-502', 'EDU-601', 'EDU-401', 'EDU-402', 'EDU-301', 'EDU-302']); 

export const Calculator = () => {
  const { activeProfile, saveProfile, setActiveProfile, isLoading, setIsLoading } = useApp();
  const [regNum, setRegNum] = useState('');
  const [passKey, setPassKey] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'normal' | 'bed'>('normal');
  const [status, setStatus] = useState({ lms: 'checking', att: 'checking' });

  useEffect(() => {
    // Check Status on Load
    fetch('/api/result-scraper?action=check_status')
      .then(res => res.json())
      .then(data => {
         if(data.success) setStatus({ lms: data.lms_status, att: data.attnd_status });
         else setStatus({ lms: 'online', att: 'online' });
      })
      .catch(() => setStatus({ lms: 'offline', att: 'offline' }));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const id = regNum.toLowerCase().trim();
      if(RESTRICTED_MAP[id]) setShowPassModal(true);
      else performFetch(id);
  };

  const verifyPassKey = () => {
      const id = regNum.toLowerCase().trim();
      if(btoa(passKey) === RESTRICTED_MAP[id]) {
          setShowPassModal(false);
          performFetch(id);
      } else {
          alert("Invalid Pass Key");
      }
  };

  const performFetch = async (id: string) => {
    setIsLoading(true);
    try {
        const profile = await fetchResults(id);
        if(profile) {
            const hasBed = Object.values(profile.semesters).some(s => 
                s.courses.some(c => BED_COURSES.has(c.code))
            );
            if(hasBed) {
                profile.bedMode = true;
                setActiveTab('normal');
            }
            saveProfile(profile);
        } else {
            alert("No result found. Please check AG Number.");
        }
    } catch(e) {
        alert("Error connecting to LMS. The server might be down.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
     if(!activeProfile) return;
     const form = document.createElement('form');
     form.method = 'POST';
     form.action = '/api/download'; 
     form.style.display = 'none';

     const doc = new jsPDF();
     doc.setFontSize(18);
     doc.text(`Transcript: ${activeProfile.studentInfo.name}`, 14, 20);
     doc.setFontSize(12);
     doc.text(`Reg No: ${activeProfile.studentInfo.registration}`, 14, 30);
     
     let yPos = 40;
     const semesters = Object.values(activeProfile.semesters).sort((a,b) => a.sortKey.localeCompare(b.sortKey));

     semesters.forEach(sem => {
         if(yPos > 270) { doc.addPage(); yPos = 20; }
         doc.setFont("helvetica", "bold");
         doc.text(`${sem.originalName} (GPA: ${sem.gpa.toFixed(2)})`, 14, yPos);
         yPos += 7;
         sem.courses.forEach(c => {
             doc.setFont("helvetica", "normal");
             doc.text(`${c.code} - ${c.title.substring(0,30)} - ${c.grade} (${c.marks})`, 14, yPos);
             yPos += 6;
         });
         yPos += 8;
     });

     const pdfBlob = doc.output('blob');
     const reader = new FileReader();
     reader.readAsDataURL(pdfBlob);
     reader.onloadend = () => {
         const inputName = document.createElement('input');
         inputName.name = 'filename';
         inputName.value = `Transcript_${activeProfile.studentInfo.registration}.pdf`;
         const inputData = document.createElement('input');
         inputData.name = 'fileData';
         inputData.value = reader.result as string;
         form.appendChild(inputName);
         form.appendChild(inputData);
         document.body.appendChild(form);
         form.submit();
         document.body.removeChild(form);
     };
  };

  if (!activeProfile) {
     return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 dark:text-white transition-colors duration-300">
             {showPassModal && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                     <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in">
                         <h3 className="text-xl font-bold mb-4 flex items-center text-red-600"><Lock className="mr-2"/> Restricted Access</h3>
                         <input type="password" value={passKey} onChange={e => setPassKey(e.target.value)} 
                                className="w-full border-2 dark:border-slate-600 dark:bg-slate-700 p-3 rounded-lg mb-4 text-slate-900 dark:text-white" placeholder="Enter Pass Key" autoFocus />
                         <Button onClick={verifyPassKey} className="w-full">Unlock</Button>
                     </div>
                 </div>
             )}

             <div className="w-full max-w-lg space-y-10 text-center">
                 <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-800 dark:text-white">Check Result</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Enter your AG Number to fetch complete transcript</p>
                 </div>
                 
                 <form onSubmit={handleSearch} className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                     <div className="relative flex shadow-xl bg-white dark:bg-slate-800 rounded-full p-2 items-center border border-slate-100 dark:border-slate-700">
                        <input value={regNum} onChange={e => setRegNum(e.target.value)} 
                                className="w-full p-4 text-xl font-bold text-slate-700 dark:text-white bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 text-center font-mono"
                                placeholder="2020-ag-1234" />
                        <Button type="submit" size="lg" className="rounded-full px-8 h-12" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin w-6 h-6"/> : <Search className="w-6 h-6"/>}
                        </Button>
                     </div>
                 </form>

                 <div className="flex justify-center gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status.lms==='online'?'bg-green-500 animate-pulse':'bg-red-500'}`}></div>
                        <span className="text-slate-500 dark:text-slate-400">LMS Server</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status.att==='online'?'bg-green-500 animate-pulse':'bg-red-500'}`}></div>
                        <span className="text-slate-500 dark:text-slate-400">Attendance</span>
                    </div>
                 </div>
             </div>
        </div>
     );
  }

  const filteredSemesters = activeProfile.bedMode 
     ? Object.values(activeProfile.semesters).map(s => ({
         ...s,
         courses: s.courses.filter(c => activeTab === 'bed' ? BED_COURSES.has(c.code) : !BED_COURSES.has(c.code))
     })).filter(s => s.courses.length > 0)
     : Object.values(activeProfile.semesters);

  const displayProfile = { ...activeProfile, semesters: {} as any };
  filteredSemesters.forEach(s => displayProfile.semesters[s.originalName] = s);
  const summary = calculateCGPA(displayProfile);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-slide-up pb-24">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-300">
             <div className="text-center md:text-left">
                 <h1 className="text-3xl font-serif font-black text-slate-900 dark:text-white">{activeProfile.studentInfo.name}</h1>
                 <div className="font-mono text-slate-500 dark:text-slate-400 mt-1">{activeProfile.studentInfo.registration}</div>
             </div>
             <div className="flex flex-wrap justify-center gap-3">
                 <Button variant="secondary" onClick={() => alert("Coming soon!")}>
                    <PlusCircle className="w-4 h-4 mr-2 text-brand-600"/> Forecast
                 </Button>
                 <Button variant="primary" onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4 mr-2"/> PDF
                 </Button>
                 <Button variant="outline" onClick={() => setActiveProfile(null)}>
                    <RefreshCcw className="w-4 h-4 mr-2"/> New
                 </Button>
             </div>
        </div>

        {/* Tabs */}
        {activeProfile.bedMode && (
            <div className="flex justify-center">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                    <button onClick={() => setActiveTab('normal')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab==='normal'?'bg-white dark:bg-slate-700 shadow text-brand-600 dark:text-brand-400':'text-slate-500'}`}>BS / MSc</button>
                    <button onClick={() => setActiveTab('bed')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab==='bed'?'bg-white dark:bg-slate-700 shadow text-brand-600 dark:text-brand-400':'text-slate-500'}`}>B.Ed</button>
                </div>
            </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 sticky top-24 space-y-6">
                <CgpaDial summary={summary} />
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-500"/> Summary
                    </h3>
                    <div className="space-y-4 text-sm dark:text-slate-300">
                        <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                            <span className="text-slate-500 dark:text-slate-400">Total Marks</span>
                            <span className="font-mono font-bold">{summary.totalMarksObtained} / {summary.totalMaxMarks}</span>
                        </div>
                        <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                            <span className="text-slate-500 dark:text-slate-400">Quality Points</span>
                            <span className="font-mono font-bold">{summary.totalQualityPoints.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Credit Hours</span>
                            <span className="font-mono font-bold">{summary.totalCreditHours}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-8">
                <SemesterList 
                    profile={{...activeProfile, semesters: displayProfile.semesters}} 
                    onUpdate={(p) => {
                        const merged = { ...activeProfile };
                        Object.assign(merged.semesters, p.semesters);
                        saveProfile(merged);
                    }} 
                />
            </div>
        </div>
    </div>
  );
};
