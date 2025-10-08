import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord, Subject, TimetableEntry } from "@/types/attendance";
import { DateAttendanceDialog } from "./DateAttendanceDialog";

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[];
  subjects: Subject[];
  timetable: TimetableEntry[];
  onEditAttendance: (subjectId: string, timetableEntryId: string, date: string, newPresent: boolean | null) => void;
  onMarkAttendance: (subjectId: string, present: boolean) => void;
}

export const AttendanceCalendar = ({ attendanceRecords, subjects, timetable, onEditAttendance, onMarkAttendance }: AttendanceCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Group records by date and calculate percentage
  const dateAttendanceMap = new Map<string, { attended: number; total: number }>();
  
  attendanceRecords.forEach(record => {
    const existing = dateAttendanceMap.get(record.date) || { attended: 0, total: 0 };
    existing.total++;
    if (record.present) existing.attended++;
    dateAttendanceMap.set(record.date, existing);
  });

  // Categorize dates by attendance percentage
  const perfect = new Set<Date>(); // 100%
  const excellent = new Set<Date>(); // 75-99%
  const good = new Set<Date>(); // 50-74%
  const poor = new Set<Date>(); // 1-49%
  const absent = new Set<Date>(); // 0%

  dateAttendanceMap.forEach((value, dateStr) => {
    const percentage = (value.attended / value.total) * 100;
    const dateObj = new Date(dateStr);
    
    if (percentage === 100) perfect.add(dateObj);
    else if (percentage >= 75) excellent.add(dateObj);
    else if (percentage >= 50) good.add(dateObj);
    else if (percentage > 0) poor.add(dateObj);
    else absent.add(dateObj);
  });

  return (
    <Card className="p-6 gradient-card border-0 shadow-lg animate-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Attendance Calendar</h3>
        <p className="text-sm text-muted-foreground">
          Track your daily attendance patterns
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate);
            if (newDate) {
              setDialogOpen(true);
            }
          }}
          className="rounded-md border"
          modifiers={{
            perfect: Array.from(perfect),
            excellent: Array.from(excellent),
            good: Array.from(good),
            poor: Array.from(poor),
            absent: Array.from(absent),
          }}
          modifiersStyles={{
            perfect: {
              backgroundColor: '#22c55e',
              color: 'white',
              fontWeight: 'bold',
            },
            excellent: {
              backgroundColor: '#84cc16',
              color: 'white',
              fontWeight: 'bold',
            },
            good: {
              backgroundColor: '#eab308',
              color: 'white',
              fontWeight: 'bold',
            },
            poor: {
              backgroundColor: '#f97316',
              color: 'white',
              fontWeight: 'bold',
            },
            absent: {
              backgroundColor: '#ef4444',
              color: 'white',
              fontWeight: 'bold',
            },
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-muted-foreground">100%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#84cc16' }} />
          <span className="text-muted-foreground">75-99%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
          <span className="text-muted-foreground">50-74%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
          <span className="text-muted-foreground">1-49%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-muted-foreground">0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <span className="text-muted-foreground">Not marked</span>
        </div>
      </div>

      {date && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg">
          <p className="text-sm font-medium">
            Selected: {format(date, "PPP")}
          </p>
        </div>
      )}

      {date && (
        <DateAttendanceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          date={date}
          subjects={subjects}
          timetable={timetable}
          attendanceRecords={attendanceRecords}
          onEditAttendance={onEditAttendance}
          onMarkAttendance={onMarkAttendance}
        />
      )}
    </Card>
  );
};
