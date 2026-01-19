import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCGPA, getSemesterOrderKey } from '../utils/gpa';
import { CgpaDial } from '../components/calculator/CgpaDial';
import { SemesterList } from '../components/calculator/SemesterList';
import { Button } from '../components/ui/Button';
import { 
  Download, Search, Loader2, Sparkles, RefreshCcw, Lock, User, BookOpen
} from 'lucide-react';
import { fetchResults } from '../services/api';
import { jsPDF } from 'jspdf';

// Passwords from your original code
const RESTRICTED_MAP: Record<string, string> = {
    '2020-ag-9423': 'am9rZXI5MTE=', // joker911
    '2019-ag-8136': 'bWlzczkxMQ=='  // miss911
};

export const Calculator = () => {
  const { activeProfile, saveProfile, setActiveProfile, isLoading, setIsLoading } = useApp();
  const [regNum, setRegNum] = useState('');
  const [passKey, setPassKey] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'normal' | 'bed'>('normal');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceCourses, setAttendanceCourses] = useState<any[]>([]);

  // Exact B.Ed Course Codes from your logic
  const BED_COURSES = new Set(['EDU-501', 'EDU-502', 'EDU-601', 'EDU-401', 'EDU-402']); 

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
          alert("Invalid Pass Key! Access Denied.");
      }
  };

  const performFetch = async (id: string) => {
    setIsLoading(true);
    try {
        const profile = await fetchResults(id);
        if(profile) {
            // Check for B.Ed courses presence
            const hasBed = Object.values(profile.semesters).some(s => 
                s.courses.some(c => BED_COURSES.has(c.code))
            );
            
            // Auto-enable B.Ed mode if detected
            if(hasBed) {
                profile.bedMode = true;
                // Don't alert every time, just enable the tab
                setActiveTab('normal'); 
            }
            saveProfile(profile);
        } else {
            alert("No result found. Please check the Registration Number.");
        }
    } catch(e) {
        console.error(e);
        alert("Connection Failed. The LMS might be down.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
     if(!activeProfile) return;
     // Create a hidden form to submit data to Python backend for download (works better on mobile)
     const form = document.createElement('form');
     form.method = 'POST';
     form.action = '/api/download'; 
     form.style.display = 'none';

     const doc = new jsPDF();
     doc.setFontSize(18);
     doc.text(`Transcript: ${activeProfile.studentInfo.name}`, 14, 20);
     doc.setFontSize(12);
     doc.text(`Reg No: ${activeProfile.studentInfo.registration}`, 14, 30);
     
     // Simple table generation
     let yPos = 40;
     Object.values(activeProfile.semesters).forEach(sem => {
         if(yPos > 250) { doc.addPage(); yPos = 20; }
         doc.setFont("helvetica", "bold");
         doc.text(sem.originalName, 14, yPos);
         yPos += 10;
         sem.courses.forEach(c => {
             doc.setFont("helvetica", "normal");
             doc.text(`${c.code} - ${c.marks} - ${c.grade}`, 14, yPos);
             yPos += 7;
         });
         yPos += 10;
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
             {showPassModal && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
                     <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
                         <h3 className="text-xl font-bold mb-4 flex items-center text-red-600"><Lock className="mr-2"/> Restricted Access</h3>
                         <p className="text-sm text-slate-500 mb-4">This result is protected. Please enter the pass key.</p>
                         <input type="password" value={passKey} onChange={e => setPassKey(e.target.value)} 
                                className="w-full border-2 border-slate-200 p-3 rounded-xl mb-4 focus:border-brand-500 outline-none" 
                                placeholder="Enter Pass Key" autoFocus />
                         <div className="flex gap-2">
                            <Button onClick={() => setShowPassModal(false)} variant="secondary" className="flex-1">Cancel</Button>
                            <Button onClick={verifyPassKey} className="flex-1">Unlock</Button>
                         </div>
                     </div>
                 </div>
             )}

             <div className="w-full max-w-lg space-y-8 text-center">
                 <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800">Check Result</h1>
                    <p className="text-slate-500">Enter your AG Number to fetch complete transcript</p>
                 </div>
                 
                 <form onSubmit={handleSearch} className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                     <div className="relative flex shadow-xl bg-white rounded-full p-2 items-center border border-slate-100">
                        <User className="ml-4 text-slate-400 w-6 h-6" />
                        <input value={regNum} onChange={e => setRegNum(e.target.value)} 
                                className="w-full p-4 text-xl font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300 placeholder:font-normal"
                                placeholder="2020-ag-1234" />
                        <Button type="submit" size="lg" className="rounded-full px-8 h-12" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin w-6 h-6"/> : <Search className="w-6 h-6"/>}
                        </Button>
                     </div>
                 </form>

                 <div className="flex justify-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center"><Lock className="w-3 h-3 mr-1"/> Secure</span>
                    <span className="flex items-center"><Sparkles className="w-3 h-3 mr-1"/> Fast</span>
                    <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1"/> Accurate</span>
                 </div>
             </div>
        </div>
     );
  }

  // Filter Logic: If B.Ed mode is active, filter courses based on tab
  const filteredSemesters = activeProfile.bedMode 
     ? Object.values(activeProfile.semesters).map(s => ({
         ...s,
         courses: s.courses.filter(c => 
             activeTab === 'bed' ? BED_COURSES.has(c.code) : !BED_COURSES.has(c.code)
         )
     })).filter(s => s.courses.length > 0)
     : Object.values(activeProfile.semesters);

  // Re-calculate summary for the view
  const displayProfile = { ...activeProfile, semesters: {} as any };
  filteredSemesters.forEach(s => displayProfile.semesters[s.originalName] = s);
  const summary = calculateCGPA(displayProfile);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Profile Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-center md:text-left">
                 <h1 className="text-3xl font-black text-slate-900">{activeProfile.studentInfo.name}</h1>
                 <div className="inline-block mt-2 px-4 py-1 bg-slate-100 rounded-full text-slate-600 font-mono font-medium">
                    {activeProfile.studentInfo.registration}
                 </div>
             </div>
             
             <div className="flex flex-wrap justify-center gap-3">
                 <Button variant="secondary" onClick={() => alert("Attendance feature coming next update!")}>
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-500"/> Attendance
                 </Button>
                 <Button variant="primary" onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4 mr-2"/> Save PDF
                 </Button>
                 <Button variant="outline" onClick={() => setActiveProfile(null)}>
                    <RefreshCcw className="w-4 h-4 mr-2"/> New Search
                 </Button>
             </div>
        </div>

        {/* Tabs for B.Ed */}
        {activeProfile.bedMode && (
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit mx-auto">
                <button 
                    onClick={() => setActiveTab('normal')} 
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab==='normal' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    BS / MSc / M.Phil
                </button>
                <button 
                    onClick={() => setActiveTab('bed')} 
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab==='bed' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    B.Ed
                </button>
            </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left: Stats */}
            <div className="lg:col-span-4 sticky top-24">
                <CgpaDial summary={summary} />
                
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Marks</div>
                        <div className="text-xl font-bold text-slate-700">{summary.totalMarksObtained}</div>
                        <div className="text-xs text-slate-400">/ {summary.totalMaxMarks}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Quality Pts</div>
                        <div className="text-xl font-bold text-slate-700">{summary.totalQualityPoints.toFixed(0)}</div>
                        <div className="text-xs text-slate-400">Total</div>
                    </div>
                </div>
            </div>
            
            {/* Right: Semesters */}
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
