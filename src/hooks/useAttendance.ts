import { useState, useEffect } from "react";
import { Subject, AttendanceRecord } from "@/types/attendance";
import { toast } from "sonner";

const STORAGE_KEY = "nishatt_attendance";
const SUBJECTS_KEY = "nishatt_subjects";

const defaultSubjects: Subject[] = [
  { id: "1", name: "Data Structures", code: "CS201", attended: 0, totalClasses: 0 },
  { id: "2", name: "Database Management", code: "CS202", attended: 0, totalClasses: 0 },
  { id: "3", name: "Operating Systems", code: "CS203", attended: 0, totalClasses: 0 },
  { id: "4", name: "Computer Networks", code: "CS204", attended: 0, totalClasses: 0 },
  { id: "5", name: "Software Engineering", code: "CS205", attended: 0, totalClasses: 0 },
];

export const useAttendance = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const savedSubjects = localStorage.getItem(SUBJECTS_KEY);
    const savedRecords = localStorage.getItem(STORAGE_KEY);

    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    } else {
      setSubjects(defaultSubjects);
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(defaultSubjects));
    }

    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      setAttendanceRecords(records.map((r: any) => ({
        ...r,
        date: new Date(r.date)
      })));
    }
  }, []);

  const markAttendance = (subjectId: string, present: boolean) => {
    const record: AttendanceRecord = {
      date: new Date(),
      subjectId,
      present,
    };

    const updatedSubjects = subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          attended: present ? subject.attended + 1 : subject.attended,
          totalClasses: subject.totalClasses + 1,
        };
      }
      return subject;
    });

    setSubjects(updatedSubjects);
    const updatedRecords = [...attendanceRecords, record];
    setAttendanceRecords(updatedRecords);

    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updatedSubjects));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));

    const subject = updatedSubjects.find(s => s.id === subjectId);
    const percentage = subject 
      ? ((subject.attended / subject.totalClasses) * 100).toFixed(1)
      : "0";

    if (present) {
      toast.success(`Marked present for ${subject?.name}`, {
        description: `Current attendance: ${percentage}%`,
      });
    } else {
      toast.error(`Marked absent for ${subject?.name}`, {
        description: `Current attendance: ${percentage}%`,
      });
    }

    // Alert if attendance falls below 75%
    if (subject && (subject.attended / subject.totalClasses) * 100 < 75) {
      toast.warning("⚠️ Attendance Alert", {
        description: `${subject.name} attendance is below 75%!`,
      });
    }
  };

  const calculateOverallStats = () => {
    const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

    // Calculate classes that can be missed while maintaining 75%
    let canMiss = 0;
    if (percentage >= 75) {
      let testAttended = totalAttended;
      let testTotal = totalClasses;
      
      while (testTotal > 0 && (testAttended / (testTotal + 1)) * 100 >= 75) {
        testTotal += 1;
        canMiss += 1;
      }
    }

    return {
      totalPercentage: percentage,
      classesAttended: totalAttended,
      totalClasses,
      canMiss,
    };
  };

  const getAttendanceDates = () => {
    return attendanceRecords
      .filter(record => record.present)
      .map(record => record.date);
  };

  return {
    subjects,
    markAttendance,
    calculateOverallStats,
    getAttendanceDates,
  };
};
