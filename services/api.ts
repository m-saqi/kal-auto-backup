// services/api.ts
import { Profile, Semester, Course } from '../types';
import { getSemesterOrderKey, calculateQualityPoints, BED_COURSES } from '../utils/gpa';

// Note: On Vercel, Python files in /api/ are treated as serverless functions automatically.
// Ensure your python file is at /api/index.py or /api/result-scraper.py

export const fetchResults = async (regNum: string): Promise<Profile | null> => {
  const response = await fetch(`/api/result-scraper?action=scrape_single&registrationNumber=${regNum}`);
  const data = await response.json();

  if (data.success && data.resultData) {
    return transformScrapedData(data.resultData);
  }
  return null;
};

export const fetchAttendance = async (regNum: string) => {
  const response = await fetch(`/api/result-scraper?action=scrape_attendance&registrationNumber=${regNum}`);
  return await response.json();
};

const transformScrapedData = (rawData: any[]): Profile => {
  const studentName = rawData[0]?.StudentName || 'Unknown';
  const registration = rawData[0]?.RegistrationNo || 'Unknown';
  
  const semesters: Record<string, Semester> = {};
  let hasBedCourses = false;

  rawData.forEach((item) => {
    let semName = item.Semester;
    
    // Normalize logic
    if (semName.toLowerCase().match(/^(winter|spring|summer|fall)(\d{2})$/)) {
       // Convert "Spring24" to "Spring 2024" logic here if needed, 
       // or rely on getSemesterOrderKey to handle it
    }

    if (!semesters[semName]) {
      semesters[semName] = {
        originalName: semName,
        sortKey: getSemesterOrderKey(semName),
        courses: [],
        gpa: 0, percentage: 0, totalQualityPoints: 0, totalCreditHours: 0, totalMarksObtained: 0, totalMaxMarks: 0
      };
    }

    const ch = parseInt(item.CreditHours || '0');
    const marks = parseFloat(item.Total || '0');
    const code = (item.CourseCode || '').trim().toUpperCase();

    if (BED_COURSES.has(code)) hasBedCourses = true;

    semesters[semName].courses.push({
      code,
      title: item.CourseTitle,
      creditHours: ch,
      marks,
      grade: item.Grade,
      qualityPoints: calculateQualityPoints(marks, ch, item.Grade),
      teacher: item.TeacherName,
      isDeleted: false,
      isCustom: false,
      isExtraEnrolled: false,
      isRepeated: false,
      source: 'lms',
      mid: item.Mid,
      final: item.Final
    });
  });

  return {
    id: `profile_${Date.now()}`,
    displayName: `${studentName} (${registration})`,
    studentInfo: { name: studentName, registration },
    semesters,
    bedMode: hasBedCourses, // Auto-detect B.Ed
    courseHistory: {},
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
};
