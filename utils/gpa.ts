import { Course, Semester, Profile, CgpaSummary } from '../types';

/**
 * Calculates Quality Points based on UAF's grading policy.
 * UAF follows a linear grading system for various percentage brackets.
 */
export const calculateQualityPoints = (marks: number, creditHours: number, grade: string): number => {
  const g = (grade || '').trim().toUpperCase();
  
  if (g === 'P') return creditHours * 4.0;
  if (g === 'F') return 0;

  const totalMarks = creditHours * 20;
  if (totalMarks === 0) return 0;
  
  const percentage = (marks / totalMarks) * 100;

  let gpa = 0;
  if (percentage >= 80) {
    gpa = 4.0;
  } else if (percentage >= 65) {
    gpa = 3.0 + ((percentage - 65) * (1.0 / 15.0));
  } else if (percentage >= 50) {
    gpa = 2.0 + ((percentage - 50) * (1.0 / 15.0));
  } else if (percentage >= 40) {
    gpa = 1.0 + ((percentage - 40) * (1.0 / 10.0));
  } else {
    gpa = 0.0;
  }

  return parseFloat((gpa * creditHours).toFixed(4));
};

/**
 * Sort key generator for semesters to ensure chronological ordering.
 */
export const getSemesterOrderKey = (name: string): string => {
  const n = (name || '').toLowerCase();
  let year = 0;
  const yearMatch = n.match(/\d{4}/);
  if (yearMatch) year = parseInt(yearMatch[0]);

  let seasonWeight = 0;
  if (n.includes('spring')) seasonWeight = 1;
  else if (n.includes('summer')) seasonWeight = 2;
  else if (n.includes('winter')) seasonWeight = 3;
  else if (n.includes('fall')) seasonWeight = 4;

  const numMatch = n.match(/(\d+)(st|nd|rd|th)/);
  if (numMatch) seasonWeight = parseInt(numMatch[1]);

  return `${year}-${seasonWeight.toString().padStart(2, '0')}`;
};

/**
 * Calculates Semester GPA and updates the semester object.
 */
export const calculateSemesterStats = (semester: Semester): void => {
  let totalQP = 0;
  let totalCH = 0;
  let totalMarks = 0;
  let totalMax = 0;

  semester.courses.forEach(course => {
    if (course.isDeleted) return;
    
    const qp = calculateQualityPoints(course.marks, course.creditHours, course.grade);
    course.qualityPoints = qp;

    totalQP += qp;
    totalCH += course.creditHours;
    totalMarks += course.marks;
    totalMax += (course.creditHours * 20);
  });

  semester.totalQualityPoints = totalQP;
  semester.totalCreditHours = totalCH;
  semester.totalMarksObtained = totalMarks;
  semester.totalMaxMarks = totalMax;
  semester.gpa = totalCH > 0 ? parseFloat((totalQP / totalCH).toFixed(4)) : 0;
  semester.percentage = totalMax > 0 ? parseFloat(((totalMarks / totalMax) * 100).toFixed(2)) : 0;
};

/**
 * Calculates overall CGPA across all semesters in a profile.
 * Handles repeated courses by only counting the latest occurrence.
 */
export const calculateCGPA = (profile: Profile): CgpaSummary => {
  if (!profile || !profile.semesters) {
    return { cgpa: 0, percentage: 0, totalQualityPoints: 0, totalCreditHours: 0, totalMarksObtained: 0, totalMaxMarks: 0 };
  }

  const sortedSemesters = Object.values(profile.semesters).sort((a, b) => 
    (a.sortKey || '').localeCompare(b.sortKey || '')
  );

  const courseMap = new Map<string, Course>();
  
  sortedSemesters.forEach(sem => {
    calculateSemesterStats(sem);
    sem.courses.forEach(course => {
      if (course.isDeleted) return;
      courseMap.set(course.code, course);
    });
  });

  let totalQP = 0;
  let totalCH = 0;
  let totalMarks = 0;
  let totalMax = 0;

  courseMap.forEach(course => {
    totalQP += course.qualityPoints;
    totalCH += course.creditHours;
    totalMarks += course.marks;
    totalMax += (course.creditHours * 20);
  });

  return {
    cgpa: totalCH > 0 ? parseFloat((totalQP / totalCH).toFixed(4)) : 0,
    percentage: totalMax > 0 ? parseFloat(((totalMarks / totalMax) * 100).toFixed(2)) : 0,
    totalQualityPoints: totalQP,
    totalCreditHours: totalCH,
    totalMarksObtained: totalMarks,
    totalMaxMarks: totalMax
  };
};