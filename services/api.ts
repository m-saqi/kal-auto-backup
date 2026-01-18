import { ScrapeResult, Profile, Course, Semester } from '../types';
import { getSemesterOrderKey, calculateQualityPoints } from '../utils/gpa';

export const fetchResults = async (regNum: string): Promise<Profile | null> => {
  try {
    const response = await fetch('/api/result-scraper?action=scrape_single', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: regNum }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.error("Server returned error:", response.status);
      return null;
    }

    const data: ScrapeResult = await response.json();

    if (data.success && data.resultData && data.resultData.length > 0) {
      return transformScrapedData(data.resultData);
    }
    return null;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const transformScrapedData = (rawData: any[]): Profile => {
  // Use flexible key access for varying API responses
  const getVal = (obj: any, keys: string[]) => {
    for (const key of keys) {
      if (obj[key] !== undefined) return obj[key];
    }
    return null;
  };

  const studentName = getVal(rawData[0], ['StudentName', 'Name', 'student_name']) || 'Unknown Student';
  const registration = getVal(rawData[0], ['RegistrationNo', 'RegNo', 'registration_number']) || 'Unknown ID';

  const semesters: Record<string, Semester> = {};

  rawData.forEach((item) => {
    let semName = getVal(item, ['Semester', 'SemesterName', 'semester']) || 'Unknown';
    
    // Normalize semester names if needed
    if (semName.match(/^\d{4}-\d{2}$/)) {
      const parts = semName.split('-');
      semName = `Semester ${parts[0]}-${parts[1]}`;
    }
    
    if (!semesters[semName]) {
      semesters[semName] = {
        originalName: semName,
        sortKey: getSemesterOrderKey(semName),
        courses: [],
        gpa: 0,
        percentage: 0,
        totalCreditHours: 0,
        totalMarksObtained: 0,
        totalMaxMarks: 0,
        totalQualityPoints: 0
      };
    }

    const chRaw = getVal(item, ['CreditHours', 'CH', 'credit_hours']) || '0';
    const ch = parseInt(String(chRaw).match(/\d+/)?.[0] || '0');
    const marks = parseFloat(String(getVal(item, ['Total', 'Marks', 'total_marks']) || '0'));
    const grade = getVal(item, ['Grade', 'grade']) || '';

    const course: Course = {
      code: getVal(item, ['CourseCode', 'Code', 'course_code']) || 'N/A',
      title: getVal(item, ['CourseTitle', 'Title', 'course_title']) || '',
      creditHours: ch,
      creditHoursDisplay: String(chRaw),
      marks: marks,
      grade: grade,
      qualityPoints: calculateQualityPoints(marks, ch, grade),
      isDeleted: false,
      isCustom: false,
      isExtraEnrolled: false,
      isRepeated: false,
      teacher: getVal(item, ['TeacherName', 'Teacher']),
      mid: String(getVal(item, ['Mid', 'mid_marks']) || ''),
      assignment: String(getVal(item, ['Assignment', 'assignment_marks']) || ''),
      final: String(getVal(item, ['Final', 'final_marks']) || ''),
      practical: String(getVal(item, ['Practical', 'practical_marks']) || ''),
      source: 'lms'
    };

    semesters[semName].courses.push(course);
  });

  return {
    id: `profile_${Date.now()}_${registration.replace(/[^a-zA-Z0-9]/g, '')}`,
    displayName: `${studentName} (${registration})`,
    studentInfo: { name: studentName, registration },
    semesters,
    courseHistory: {},
    bedMode: false,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
};