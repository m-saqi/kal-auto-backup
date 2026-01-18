import React from 'react';
import { Profile, Semester } from '../../types';
import { Trash2 } from 'lucide-react';

interface SemesterListProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export const SemesterList: React.FC<SemesterListProps> = ({ profile, onUpdate }) => {
  const sortedSemesters = (Object.values(profile.semesters) as Semester[]).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const handleDeleteSemester = (name: string) => {
    if (window.confirm(`Delete ${name}?`)) {
      const updated = { ...profile };
      delete updated.semesters[name];
      onUpdate(updated);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {sortedSemesters.map((sem) => (
        <SemesterCard key={sem.originalName} semester={sem} onDelete={() => handleDeleteSemester(sem.originalName)} />
      ))}
    </div>
  );
};

const SemesterCard: React.FC<{ semester: Semester; onDelete: () => void }> = ({ semester, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
            <h3 className="font-black text-sm md:text-base text-slate-800 dark:text-white flex items-center gap-2">
                {semester.originalName}
                {semester.isForecast && <span className="text-[9px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-md uppercase font-black">Plan</span>}
            </h3>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5 flex gap-3 uppercase tracking-wider">
                <span>GPA: <strong className="text-brand-600">{semester.gpa.toFixed(4)}</strong></span>
                <span>CH: {semester.totalCreditHours}</span>
            </div>
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors p-2">
            <Trash2 size={16} />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr>
                    <th className="px-4 py-2">Course</th>
                    <th className="px-4 py-2 text-center">CH</th>
                    <th className="px-4 py-2 text-center">Marks</th>
                    <th className="px-4 py-2 text-center">Grade</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-medium">
                {semester.courses.map((course, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                            <div className="text-[11px] font-black text-slate-900 dark:text-slate-200">{course.code}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{course.title}</div>
                        </td>
                        <td className="px-4 py-2 text-center text-[11px] text-slate-600 dark:text-slate-400">{course.creditHours}</td>
                        <td className="px-4 py-2 text-center text-[11px] font-mono text-slate-700 dark:text-slate-300">{course.marks}</td>
                        <td className="px-4 py-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                                course.grade === 'A' ? 'bg-green-50 text-green-600' :
                                course.grade === 'F' ? 'bg-red-50 text-red-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {course.grade}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
