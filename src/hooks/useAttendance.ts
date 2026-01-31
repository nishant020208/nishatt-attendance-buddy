import { useState, useEffect } from "react";
import { Subject, TimetableEntry, AttendanceRecord } from "@/types/attendance";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const useAttendance = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch all data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        setUserId(user.id);

        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (subjectsError) throw subjectsError;

        const mappedSubjects: Subject[] = (subjectsData || []).map(s => ({
          id: s.id,
          name: s.name,
          code: s.code,
          attended: s.attended_classes || 0,
          totalClasses: s.total_classes || 0,
        }));
        setSubjects(mappedSubjects);

        // Fetch timetable
        const { data: timetableData, error: timetableError } = await supabase
          .from('user_timetable')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (timetableError) throw timetableError;

        const mappedTimetable: TimetableEntry[] = (timetableData || []).map(t => ({
          id: t.id,
          day: t.day,
          subjectId: t.subject_id,
          time: t.time,
        }));
        setTimetable(mappedTimetable);

        // Fetch attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('user_attendance')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (attendanceError) throw attendanceError;

        const mappedAttendance: AttendanceRecord[] = (attendanceData || []).map(a => ({
          date: a.date,
          subjectId: a.subject_id,
          timetableEntryId: a.timetable_entry_id || '',
          present: a.present ? true : (a.present === false ? false : null),
        }));
        setAttendanceRecords(mappedAttendance);

        // Clear old localStorage data (migration cleanup)
        localStorage.removeItem('nishatt_subjects');
        localStorage.removeItem('nishatt_timetable');
        localStorage.removeItem('nishatt_attendance');
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data', {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteSubject = async (id: string) => {
    if (!userId) return;

    try {
      // Delete subject (cascade will handle timetable and attendance)
      const { error } = await supabase
        .from('user_subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setSubjects(subjects.filter(s => s.id !== id));
      setTimetable(timetable.filter(t => t.subjectId !== id));
      setAttendanceRecords(attendanceRecords.filter(r => r.subjectId !== id));
      
      toast.success('Subject deleted successfully');
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject', {
        description: error.message
      });
    }
  };

  const addSubject = async (name: string, code: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_subjects')
        .insert({
          user_id: userId,
          name,
          code,
          attended_classes: 0,
          total_classes: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newSubject: Subject = {
        id: data.id,
        name: data.name,
        code: data.code,
        attended: 0,
        totalClasses: 0,
      };

      setSubjects([...subjects, newSubject]);
      toast.success('Subject added successfully');
    } catch (error: any) {
      console.error('Error adding subject:', error);
      toast.error('Failed to add subject', {
        description: error.message
      });
    }
  };

  const addToTimetable = async (day: string, subjectId: string, time: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_timetable')
        .insert({
          user_id: userId,
          day,
          subject_id: subjectId,
          time,
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: TimetableEntry = {
        id: data.id,
        day: data.day,
        subjectId: data.subject_id,
        time: data.time,
      };

      setTimetable([...timetable, newEntry]);
      toast.success("Added to timetable!");
    } catch (error: any) {
      console.error('Error adding to timetable:', error);
      toast.error('Failed to add to timetable', {
        description: error.message
      });
    }
  };

  const removeFromTimetable = async (id: string) => {
    if (!userId) return;

    try {
      const entry = timetable.find(e => e.id === id);
      
      const { error } = await supabase
        .from('user_timetable')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      const updated = timetable.filter(entry => entry.id !== id);
      setTimetable(updated);

      // Check if this was the last timetable entry for this subject
      if (entry) {
        const hasOtherEntries = updated.some(e => e.subjectId === entry.subjectId);
        
        if (!hasOtherEntries) {
          // Remove all attendance records for this subject
          await supabase
            .from('user_attendance')
            .delete()
            .eq('subject_id', entry.subjectId)
            .eq('user_id', userId);
            
          const updatedRecords = attendanceRecords.filter(r => r.subjectId !== entry.subjectId);
          setAttendanceRecords(updatedRecords);

          // Reset subject attendance
          await supabase
            .from('user_subjects')
            .update({
              attended_classes: 0,
              total_classes: 0,
            })
            .eq('id', entry.subjectId)
            .eq('user_id', userId);
            
          const updatedSubjects = subjects.map(s => 
            s.id === entry.subjectId 
              ? { ...s, attended: 0, totalClasses: 0 }
              : s
          );
          setSubjects(updatedSubjects);
        }
      }

      toast.success("Removed from timetable");
    } catch (error: any) {
      console.error('Error removing from timetable:', error);
      toast.error('Failed to remove from timetable', {
        description: error.message
      });
    }
  };

  const markAttendance = async (subjectId: string, present: boolean | null) => {
    if (!userId) return;

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const todayDay = format(new Date(), "EEEE");
      const timetableEntry = timetable.find(
        entry => entry.day === todayDay && entry.subjectId === subjectId
      );

      if (!timetableEntry) return;

      // DUPLICATE PREVENTION: Check if attendance already exists for this slot
      const existingRecord = attendanceRecords.find(
        r => r.timetableEntryId === timetableEntry.id && r.date === today
      );

      if (existingRecord) {
        toast.error("Attendance already marked", {
          description: "Use the edit button to change attendance status"
        });
        return;
      }

      // Insert attendance record
      const { error: insertError } = await supabase
        .from('user_attendance')
        .insert({
          user_id: userId,
          date: today,
          subject_id: subjectId,
          timetable_entry_id: timetableEntry.id,
          present: present === null ? false : present, // Store null as false, handle logic separately
        });

      if (insertError) throw insertError;

      const record: AttendanceRecord = {
        date: today,
        subjectId,
        timetableEntryId: timetableEntry.id,
        present,
      };

      setAttendanceRecords([...attendanceRecords, record]);

      // Update subject stats
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      let newAttended = subject.attended;
      let newTotal = subject.totalClasses;

      // Off (null) means no class happened, so don't count it at all (0/0)
      if (present !== null) {
        newAttended = present ? subject.attended + 1 : subject.attended;
        newTotal = subject.totalClasses + 1;
      }

      if (present !== null) {
        const { error: updateError } = await supabase
          .from('user_subjects')
          .update({
            attended_classes: newAttended,
            total_classes: newTotal,
          })
          .eq('id', subjectId)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      const updatedSubjects = subjects.map(s => 
        s.id === subjectId 
          ? { ...s, attended: newAttended, totalClasses: newTotal }
          : s
      );
      setSubjects(updatedSubjects);

      // Toast notifications
      if (present === true) {
        const percentage = newTotal > 0
          ? ((newAttended / newTotal) * 100).toFixed(1)
          : "0";
        toast.success(`Marked present for ${subject.name}`, {
          description: `Current attendance: ${percentage}%`,
        });
        
        if ((newAttended / newTotal) * 100 < 75) {
          toast.warning("⚠️ Attendance Alert", {
            description: `${subject.name} attendance is below 75%!`,
          });
        }
      } else if (present === false) {
        const percentage = newTotal > 0
          ? ((newAttended / newTotal) * 100).toFixed(1)
          : "0";
        toast.error(`Marked absent for ${subject.name}`, {
          description: `Current attendance: ${percentage}%`,
        });
        
        if ((newAttended / newTotal) * 100 < 75) {
          toast.warning("⚠️ Attendance Alert", {
            description: `${subject.name} attendance is below 75%!`,
          });
        }
      } else {
        toast.info(`Class off for ${subject.name}`, {
          description: "Not counted in attendance stats",
        });
      }
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance', {
        description: error.message
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

  const importTimetable = async (importedTimetable: TimetableEntry[]) => {
    if (!userId) return;

    try {
      const insertData = importedTimetable.map(entry => ({
        user_id: userId,
        day: entry.day,
        subject_id: entry.subjectId,
        time: entry.time,
      }));

      const { data, error } = await supabase
        .from('user_timetable')
        .insert(insertData)
        .select();

      if (error) throw error;

      const mappedEntries: TimetableEntry[] = (data || []).map(t => ({
        id: t.id,
        day: t.day,
        subjectId: t.subject_id,
        time: t.time,
      }));

      setTimetable([...timetable, ...mappedEntries]);
      toast.success('Timetable imported successfully');
    } catch (error: any) {
      console.error('Error importing timetable:', error);
      toast.error('Failed to import timetable', {
        description: error.message
      });
    }
  };

  const editAttendance = async (subjectId: string, timetableEntryId: string, date: string, newPresent: boolean | null) => {
    if (!userId) return;

    try {
      const recordIndex = attendanceRecords.findIndex(
        r => r.subjectId === subjectId && r.timetableEntryId === timetableEntryId && r.date === date
      );

      if (recordIndex === -1) return;

      const oldPresent = attendanceRecords[recordIndex].present;

      // Update attendance record in database
      const { error: updateError } = await supabase
        .from('user_attendance')
        .update({ present: newPresent === null ? false : newPresent })
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .eq('date', date)
        .eq('timetable_entry_id', timetableEntryId);

      if (updateError) throw updateError;

      const updatedRecords = [...attendanceRecords];
      updatedRecords[recordIndex] = { ...updatedRecords[recordIndex], present: newPresent };
      setAttendanceRecords(updatedRecords);

      // Calculate new stats
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      let attended = subject.attended;
      let totalClasses = subject.totalClasses;
      
      // Off (null) means class never happened (0/0)
      // Handle all state transitions correctly
      if (oldPresent === null && newPresent === true) {
        attended++;
        totalClasses++;
      } else if (oldPresent === null && newPresent === false) {
        totalClasses++;
      } else if (oldPresent === true && newPresent === null) {
        attended--;
        totalClasses--;
      } else if (oldPresent === false && newPresent === null) {
        totalClasses--;
      } else if (oldPresent === true && newPresent === false) {
        attended--;
      } else if (oldPresent === false && newPresent === true) {
        attended++;
      }

      // Update subject stats in database
      const { error: subjectError } = await supabase
        .from('user_subjects')
        .update({
          attended_classes: attended,
          total_classes: totalClasses,
        })
        .eq('id', subjectId)
        .eq('user_id', userId);

      if (subjectError) throw subjectError;

      const updatedSubjects = subjects.map(s => 
        s.id === subjectId 
          ? { ...s, attended, totalClasses }
          : s
      );
      setSubjects(updatedSubjects);
      
      const statusText = newPresent === true ? "present" : newPresent === false ? "absent" : "off";
      toast.success(`Attendance marked as ${statusText}`);
    } catch (error: any) {
      console.error('Error editing attendance:', error);
      toast.error('Failed to edit attendance', {
        description: error.message
      });
    }
  };

  const markAttendanceForDate = async (subjectId: string, timetableEntryId: string, date: string, present: boolean | null) => {
    if (!userId) return;

    try {
      // DUPLICATE PREVENTION: Check if attendance already exists for this slot
      const existingRecord = attendanceRecords.find(
        r => r.timetableEntryId === timetableEntryId && r.date === date
      );

      if (existingRecord) {
        toast.error("Attendance already marked for this slot", {
          description: "Use the edit option to change attendance status"
        });
        return;
      }

      // Insert attendance record
      const { error: insertError } = await supabase
        .from('user_attendance')
        .insert({
          user_id: userId,
          date: date,
          subject_id: subjectId,
          timetable_entry_id: timetableEntryId,
          present: present === null ? false : present,
        });

      if (insertError) throw insertError;

      const record: AttendanceRecord = {
        date: date,
        subjectId,
        timetableEntryId,
        present,
      };

      setAttendanceRecords([...attendanceRecords, record]);

      // Update subject stats (Off doesn't count)
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      let newAttended = subject.attended;
      let newTotal = subject.totalClasses;

      if (present !== null) {
        newAttended = present ? subject.attended + 1 : subject.attended;
        newTotal = subject.totalClasses + 1;

        const { error: updateError } = await supabase
          .from('user_subjects')
          .update({
            attended_classes: newAttended,
            total_classes: newTotal,
          })
          .eq('id', subjectId)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      const updatedSubjects = subjects.map(s => 
        s.id === subjectId 
          ? { ...s, attended: newAttended, totalClasses: newTotal }
          : s
      );
      setSubjects(updatedSubjects);

      const statusText = present === true ? "present" : present === false ? "absent" : "off";
      toast.success(`Attendance marked as ${statusText}`);
    } catch (error: any) {
      console.error('Error marking attendance for date:', error);
      toast.error('Failed to mark attendance', {
        description: error.message
      });
    }
  };

  return {
    subjects,
    timetable,
    attendanceRecords,
    addSubject,
    deleteSubject,
    addToTimetable,
    removeFromTimetable,
    markAttendance,
    markAttendanceForDate,
    editAttendance,
    getTodayTimetable,
    getMarkedToday,
    calculateOverallStats,
    importTimetable,
    loading,
  };
};