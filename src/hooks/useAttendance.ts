import { useState, useEffect } from "react";
import { Subject, TimetableEntry, AttendanceRecord } from "@/types/attendance";
import { toast } from "sonner";
import { format } from "date-fns";

const SUBJECTS_KEY = "nishatt_subjects";
const TIMETABLE_KEY = "nishatt_timetable";
const ATTENDANCE_KEY = "nishatt_attendance";

export const useAttendance = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const savedSubjects = localStorage.getItem(SUBJECTS_KEY);
    const savedTimetable = localStorage.getItem(TIMETABLE_KEY);
    const savedAttendance = localStorage.getItem(ATTENDANCE_KEY);

    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedTimetable) setTimetable(JSON.parse(savedTimetable));
    if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
  }, []);

  const addSubject = (name: string, code: string) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      code,
      attended: 0,
      totalClasses: 0,
    };

    const updated = [...subjects, newSubject];
    setSubjects(updated);
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated));
  };

  const addToTimetable = (day: string, subjectId: string, time: string) => {
    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      day,
      subjectId,
      time,
    };

    const updated = [...timetable, newEntry];
    setTimetable(updated);
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(updated));
    toast.success("Added to timetable!");
  };

  const removeFromTimetable = (id: string) => {
    const updated = timetable.filter(entry => entry.id !== id);
    setTimetable(updated);
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(updated));
    toast.success("Removed from timetable");
  };

  const markAttendance = (subjectId: string, present: boolean) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayDay = format(new Date(), "EEEE");
    const timetableEntry = timetable.find(
      entry => entry.day === todayDay && entry.subjectId === subjectId
    );

    if (!timetableEntry) return;

    const record: AttendanceRecord = {
      date: today,
      subjectId,
      timetableEntryId: timetableEntry.id,
      present,
    };

    const updatedRecords = [...attendanceRecords, record];
    setAttendanceRecords(updatedRecords);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updatedRecords));

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
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updatedSubjects));

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

    if (subject && (subject.attended / subject.totalClasses) * 100 < 75) {
      toast.warning("⚠️ Attendance Alert", {
        description: `${subject.name} attendance is below 75%!`,
      });
    }
  };

  const getTodayTimetable = () => {
    const today = format(new Date(), "EEEE");
    return timetable.filter(entry => entry.day === today);
  };

  const getMarkedToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return attendanceRecords
      .filter(record => record.date === today)
      .map(record => record.timetableEntryId);
  };

  const calculateOverallStats = () => {
    const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

    let canMiss = 0;
    if (percentage >= 75 && totalClasses > 0) {
      let testAttended = totalAttended;
      let testTotal = totalClasses;
      
      while ((testAttended / (testTotal + 1)) * 100 >= 75) {
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
      .map(record => new Date(record.date));
  };

  return {
    subjects,
    timetable,
    addSubject,
    addToTimetable,
    removeFromTimetable,
    markAttendance,
    getTodayTimetable,
    getMarkedToday,
    calculateOverallStats,
    getAttendanceDates,
  };
};
