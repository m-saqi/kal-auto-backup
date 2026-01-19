import { Semester, Profile, CgpaSummary } from '../types';

export const calculateQualityPoints = (marks: number, creditHours: number, grade: string): number => {
  const g = (grade || '').trim().toUpperCase();
  if (g === 'P') return creditHours * 4.0;
  if (g === 'F') return 0;

  // Exact UAF Linear Interpolation Logic
  let qp = 0;
  
  // Logic per credit hour derived from your original HTML
  if (creditHours === 10) {
    if (marks >= 160) qp = 40;
    else if (marks >= 100) qp = 40 - ((160 - marks) * 0.33333);
    else if (marks < 100) qp = 20 - ((100 - marks) * 0.5);
    if (marks < 80) qp = 0;
  } 
  else if (creditHours === 4) {
    if (marks >= 64) qp = 16;
    else if (marks >= 40) qp = 16 - ((64 - marks) * 0.33333);
    else if (marks < 40) qp = 8 - ((40 - marks) * 0.5);
    if (marks < 32) qp = 0;
  } 
  else if (creditHours === 3) {
    if (marks >= 48) qp = 12;
    else if (marks >= 30) qp = 12 - ((48 - marks) * 0.33333);
    else if (marks < 30) qp = 6 - ((30 - marks) * 0.5);
    if (marks < 24) qp = 0;
  }
  else if (creditHours === 1) {
    if (marks >= 16) qp = 4;
    else if (marks >= 10) qp = 4 - ((16 - marks) * 0.33333);
    else if (marks < 10) qp = 2 - ((10 - marks) * 0.5);
    if (marks < 8) qp = 0;
  }
  // ... (Add other credit hours 9,8,7,6,5,2 based on the pattern if needed, standard logic below covers gaps)
  else {
      // Fallback for standard 20 marks/CH
      const maxM = creditHours * 20;
      const p80 = maxM * 0.8;
      const p50 = maxM * 0.5;
      const p40 = maxM * 0.4;
      
      if (marks >= p80) qp = creditHours * 4;
      else if (marks >= p50) qp = (creditHours * 4) - ((p80 - marks) * 0.33333);
      else if (marks < p50) qp = (creditHours * 2) - ((p50 - marks) * 0.5);
      if (marks < p40) qp = 0;
  }

  return parseFloat(Math.max(0, qp).toFixed(2));
};

export const getSemesterOrderKey = (name: string): string => {
  const n = (name || '').toLowerCase();
  if(n.startsWith('forecast')) return `9999-${n}`;
  
  let year = 0;
  const yearMatch = n.match(/\d{4}/);
  if (yearMatch) year = parseInt(yearMatch[0]);

  let season = 9;
  if (n.includes('winter')) season = 1;
  else if (n.includes('spring')) season = 2;
  else if (n.includes('summer')) season = 3;
  else if (n.includes('fall')) season = 4;

  return `${year}-${season}`;
};

export const calculateCGPA = (profile: Profile): CgpaSummary => {
  // Re-implement the BEST ATTEMPT logic
  const history: Record<string, any[]> = {};
  const allSemesters = Object.values(profile.semesters);

  // 1. Gather all course attempts
  allSemesters.forEach(sem => {
    sem.courses.forEach(c => {
      if(c.isDeleted) return;
      if(!history[c.code]) history[c.code] = [];
      history[c.code].push({ ...c, semesterKey: sem.sortKey });
    });
  });

  // 2. Identify Repeats
  Object.values(history).forEach(attempts => {
    attempts.sort((a,b) => b.marks - a.marks); // Best marks first
    // Highest marks is valid, others are "extra enrolled"
    attempts.forEach((att, idx) => {
        att.isRepeated = attempts.length > 1;
        att.isExtraEnrolled = idx > 0;
    });
  });

  // 3. Calculate Totals
  let tQP = 0, tCH = 0, tMarks = 0, tMax = 0;
  
  // Re-iterate to sum up valid courses
  allSemesters.forEach(sem => {
    let sQP = 0, sCH = 0, sMarks = 0, sMax = 0;
    
    sem.courses.forEach(c => {
      if(c.isDeleted) return;
      // Update flags based on history calculation
      const attempt = history[c.code].find(h => h.semesterKey === sem.sortKey && h.marks === c.marks);
      if(attempt) {
          c.isExtraEnrolled = attempt.isExtraEnrolled;
          c.isRepeated = attempt.isRepeated;
      }

      // Calculate logic
      c.qualityPoints = calculateQualityPoints(c.marks, c.creditHours, c.grade);
      
      if(!c.isExtraEnrolled) {
          sQP += c.qualityPoints;
          sCH += c.creditHours;
          sMarks += c.marks;
          sMax += (c.creditHours * 20);
      }
    });

    sem.gpa = sCH > 0 ? sQP/sCH : 0;
    sem.totalQualityPoints = sQP;
    sem.totalCreditHours = sCH;
    sem.totalMarksObtained = sMarks;
    
    tQP += sQP; tCH += sCH; tMarks += sMarks; tMax += sMax;
  });

  return {
    cgpa: tCH > 0 ? tQP/tCH : 0,
    percentage: tMax > 0 ? (tMarks/tMax)*100 : 0,
    totalQualityPoints: tQP,
    totalCreditHours: tCH,
    totalMarksObtained: tMarks,
    totalMaxMarks: tMax
  };
};
