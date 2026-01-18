// types.ts
export interface StudentInfo {
  name: string;
  registration: string;
}

export interface Course {
  code: string;
  title: string;
  creditHours: number;
  creditHoursDisplay?: string;
  marks: number;
  qualityPoints: number;
  grade: string;
  teacher?: string;
  isExtraEnrolled: boolean;
  isRepeated: boolean;
  isDeleted: boolean;
  isCustom: boolean;
  source?: 'lms' | 'attendance';
  originalSemester?: string;
}

export interface Semester {
  originalName: string;
  sortKey: string;
  courses: Course[];
  gpa: number;
  percentage: number;
  totalQualityPoints: number;
  totalCreditHours: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
  isForecast?: boolean;
  hasBedCourses?: boolean;
}

export interface Profile {
  id: string;
  displayName: string;
  studentInfo: StudentInfo;
  semesters: Record<string, Semester>;
  bedMode: boolean;
  createdAt: string;
  lastModified: string;
}

export interface CgpaSummary {
  cgpa: number;
  percentage: number;
  totalQualityPoints: number;
  totalCreditHours: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
}
