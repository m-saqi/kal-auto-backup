import React from 'react';
import { CgpaSummary } from '../../types';

interface CgpaDialProps {
  summary: CgpaSummary;
}

export const CgpaDial: React.FC<CgpaDialProps> = ({ summary }) => {
  // SVG Circle Calc
  const radius = 45; // Reduced radius for better mobile fit
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - ((summary.percentage / 100) * circumference);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center">
        <svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="transform -rotate-90 drop-shadow-sm"
        >
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-slate-100 dark:text-slate-700"
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-brand-500 dark:text-brand-400"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {summary.cgpa.toFixed(4)}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black mt-0.5">
            CGPA
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 w-full text-center divide-x divide-slate-100 dark:divide-slate-700">
        <div>
          <p className="text-slate-400 text-[9px] uppercase font-black mb-1">Percentage</p>
          <p className="text-sm md:text-base font-black text-slate-800 dark:text-slate-200">{summary.percentage.toFixed(2)}%</p>
        </div>
        <div>
           <p className="text-slate-400 text-[9px] uppercase font-black mb-1">Credits</p>
           <p className="text-sm md:text-base font-black text-slate-800 dark:text-slate-200">{summary.totalCreditHours}</p>
        </div>
        <div>
           <p className="text-slate-400 text-[9px] uppercase font-black mb-1">Marks</p>
           <p className="text-sm md:text-base font-black text-slate-800 dark:text-slate-200">{summary.totalMarksObtained.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};
