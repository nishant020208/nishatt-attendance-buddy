export interface Subject {
  id: string;
  name: string;
  code: string;
  attended: number;
  totalClasses: number;
}

export interface TimetableEntry {
  id: string;
  day: string;
  subjectId: string;
  time: string;
}

export interface AttendanceRecord {
  date: string;
  subjectId: string;
  timetableEntryId: string;
  present: boolean;
}
