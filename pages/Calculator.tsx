import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCGPA, getSemesterOrderKey } from '../utils/gpa';
import { CgpaDial } from '../components/calculator/CgpaDial';
import { SemesterList } from '../components/calculator/SemesterList';
import { Button } from '../components/ui/Button';
import { 
  Download, Search, Loader2, Sparkles, RefreshCcw, Lock, PlusCircle, Activity
} from 'lucide-react';
import { fetchResults } from '../services/api';
import { jsPDF } from 'jspdf';
import { Profile, Course } from '../types';

const RESTRICTED_MAP: Record<string, string> = {
    '2020-ag-9423': 'am9rZXI5MTE=', 
    '2019-ag-8136': 'bWlzczkxMQ=='
};

// Exact B.Ed codes
const BED_COURSES = new Set(['EDU-501', 'EDU-502', 'EDU-601', 'EDU-401', 'EDU-402', 'EDU-301', 'EDU-302']); 

export const Calculator = () => {
  const { activeProfile, saveProfile, setActiveProfile, isLoading, setIsLoading } = useApp();
  const [regNum, setRegNum] = useState('');
  const [passKey, setPassKey] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'normal' | 'bed'>('normal');
  
  // Status State
  const [status, setStatus] = useState({ lms: 'checking', att: 'checking' });

  useEffect(() => {
    // Mimic the status check from old index.html
    const checkStatus = async () => {
        try {
            const res = await fetch('/api/result-scraper?action=check_status');
            const data = await res.json();
            if(data.success && data.lms_status) {
                setStatus({ lms: data.lms_status, att: data.attnd_status });
            } else {
                setStatus({ lms: 'online', att: 'online' }); // Fallback assuming operational
            }
        } catch {
            setStatus({ lms: 'offline', att: 'offline' });
        }
    };
    checkStatus();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const id = regNum.toLowerCase().trim();
      if(RESTRICTED_MAP[id]) {
          setShowPassModal(true);
      } else {
          performFetch(id);
      }
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
        alert("Error connecting to LMS.");
    } finally {
        setIsLoading(false);
    }
  };

  const addForecastSemester = () => {
      if(!activeProfile) return;
      const newProfile = { ...activeProfile };
      const forecastId = `Forecast-${Date.now()}`; // Unique ID
      newProfile.semesters[forecastId] = {
          originalName: "Forecast Semester",
          sortKey: `9999-${Date.now()}`, // Force to bottom
          courses: [
              { code: 'EST-101', title: 'Forecast Course 1', creditHours: 3, marks: 60, grade: 'B', qualityPoints: 9, isCustom: true, isDeleted: false, creditHoursDisplay: '3' },
              { code: 'EST-102', title: 'Forecast Course 2', creditHours: 3, marks: 50, grade: 'C', qualityPoints: 8, isCustom: true, isDeleted: false, creditHoursDisplay: '3' }
          ],
          gpa: 0, percentage: 0, totalCreditHours: 0, totalMarksObtained: 0, totalMaxMarks: 0, totalQualityPoints: 0
      };
      saveProfile(newProfile);
  };

  const handleDownloadPDF = () => {
     if(!activeProfile) return;
     const form = document.createElement('form');
     form.method = 'POST';
     form.action = '/api/download'; 
     form.style.display = 'none';

     const doc = new jsPDF();
     // Academic Header
     doc.setFont("times", "bold");
     doc.setFontSize(22);
     doc.text("University of Agriculture, Faisalabad", 105, 20, { align: "center" });
     doc.setFontSize(16);
     doc.text("Provisional Transcript", 105, 30, { align: "center" });
     
     // Student Info
     doc.setFontSize(12);
     doc.setFont("helvetica", "normal");
     doc.text(`Name: ${activeProfile.studentInfo.name}`, 20, 45);
     doc.text(`Reg No: ${activeProfile.studentInfo.registration.toUpperCase()}`, 140, 45);
     doc.line(20, 48, 190, 48);

     let y = 60;
     const semesters = Object.values(activeProfile.semesters).sort((a,b) => a.sortKey.localeCompare(b.sortKey));

     semesters.forEach(sem => {
         if (y > 270) { doc.addPage(); y = 20; }
         doc.setFont("helvetica", "bold");
         doc.setFillColor(240, 240, 240);
         doc.rect(20, y-5, 170, 8, 'F');
         doc.text(`${sem.originalName} (GPA: ${sem.gpa.toFixed(2)})`, 22, y);
         y += 8;

         sem.courses.forEach(c => {
             if (y > 280) { doc.addPage(); y = 20; }
             doc.setFont("helvetica", "normal");
             doc.text(`${c.code}`, 22, y);
             doc.text(`${c.title.substring(0, 40)}`, 50, y);
             doc.text(`${c.marks.toString()}`, 150, y);
             doc.text(`${c.grade}`, 170, y);
             y += 6;
         });
         y += 10;
     });

     // Footer Summary
     const summary = calculateCGPA(activeProfile);
     doc.line(20, y, 190, y);
     y += 10;
     doc.setFont("helvetica", "bold");
     doc.text(`CGPA: ${summary.cgpa.toFixed(4)}`, 150, y);

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
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
             {showPassModal && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                     <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in">
                         <h3 className="text-xl font-bold mb-4 flex items-center text-red-600"><Lock className="mr-2"/> Restricted Access</h3>
                         <input type="password" value={passKey} onChange={e => setPassKey(e.target.value)} 
                                className="w-full border-2 p-3 rounded-lg mb-4" placeholder="Enter Pass Key" autoFocus />
                         <Button onClick={verifyPassKey} className="w-full">Unlock</Button>
                     </div>
                 </div>
             )}

             <div className="w-full max-w-lg space-y-10 text-center">
                 <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-800">Check Result</h1>
                    <p className="text-slate-500 text-lg">Enter your AG Number to fetch complete transcript</p>
                 </div>
                 
                 <form onSubmit={handleSearch} className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                     <div className="relative flex shadow-xl bg-white rounded-full p-2 items-center border border-slate-100">
                        <input value={regNum} onChange={e => setRegNum(e.target.value)} 
                                className="w-full p-4 text-xl font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300 text-center font-mono"
                                placeholder="2020-ag-1234" />
                        <Button type="submit" size="lg" className="rounded-full px-8 h-12" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin w-6 h-6"/> : <Search className="w-6 h-6"/>}
                        </Button>
                     </div>
                 </form>

                 {/* Status Indicators from Old HTML */}
                 <div className="flex justify-center gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status.lms==='online'?'bg-green-500 animate-pulse':'bg-red-500'}`}></div>
                        <span className="text-slate-500">LMS Server</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status.att==='online'?'bg-green-500 animate-pulse':'bg-red-500'}`}></div>
                        <span className="text-slate-500">Attendance</span>
                    </div>
                 </div>
             </div>
        </div>
     );
  }

  // B.Ed Filter
  const filteredSemesters = activeProfile.bedMode 
     ? Object.values(activeProfile.semesters).map(s => ({
         ...s,
         courses: s.courses.filter(c => 
             activeTab === 'bed' ? BED_COURSES.has(c.code) : !BED_COURSES.has(c.code)
         )
     })).filter(s => s.courses.length > 0)
     : Object.values(activeProfile.semesters);

  const displayProfile = { ...activeProfile, semesters: {} as any };
  filteredSemesters.forEach(s => displayProfile.semesters[s.originalName] = s);
  const summary = calculateCGPA(displayProfile);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-slide-up">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-center md:text-left">
                 <h1 className="text-3xl font-serif font-black text-slate-900">{activeProfile.studentInfo.name}</h1>
                 <div className="font-mono text-slate-500 mt-1">{activeProfile.studentInfo.registration}</div>
             </div>
             <div className="flex flex-wrap justify-center gap-3">
                 <Button variant="secondary" onClick={addForecastSemester}>
                    <PlusCircle className="w-4 h-4 mr-2 text-brand-600"/> Forecast
                 </Button>
                 <Button variant="outline" onClick={handleDownloadPDF}>
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
                <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button onClick={() => setActiveTab('normal')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab==='normal'?'bg-white shadow text-brand-600':'text-slate-500'}`}>BS / MSc</button>
                    <button onClick={() => setActiveTab('bed')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab==='bed'?'bg-white shadow text-brand-600':'text-slate-500'}`}>B.Ed</button>
                </div>
            </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 sticky top-24 space-y-6">
                <CgpaDial summary={summary} />
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-serif font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-500"/> Summary
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Total Marks</span>
                            <span className="font-mono font-bold">{summary.totalMarksObtained} / {summary.totalMaxMarks}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Quality Points</span>
                            <span className="font-mono font-bold">{summary.totalQualityPoints.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Credit Hours</span>
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
