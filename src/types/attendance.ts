export interface Subject {
  id: string;
  name: string;
  code: string;
  attended: number;
  totalClasses: number;
}

export interface AttendanceRecord {
  date: Date;
  subjectId: string;
  present: boolean;
}
