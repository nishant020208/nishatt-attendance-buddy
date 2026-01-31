import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { Subject, TimetableEntry, AttendanceRecord } from "@/types/attendance";
import { useState } from "react";
import { format } from "date-fns";

interface SubjectCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject;
  timetable: TimetableEntry[];
  attendanceRecords: AttendanceRecord[];
  onEditAttendance: (subjectId: string, timetableEntryId: string, date: string, newPresent: boolean | null) => void;
  onMarkAttendanceForDate: (subjectId: string, timetableEntryId: string, date: string, present: boolean | null) => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const SubjectCalendarDialog = ({
  open,
  onOpenChange,
  subject,
  timetable,
  attendanceRecords,
  onEditAttendance,
  onMarkAttendanceForDate
}: SubjectCalendarDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Get attendance records for this subject only
  const subjectRecords = attendanceRecords.filter(r => r.subjectId === subject.id);
  
  // Categorize dates by attendance for this subject
  const presentDates = new Set<string>();
  const absentDates = new Set<string>();
  const offDates = new Set<string>();

  subjectRecords.forEach(record => {
    if (record.present === true) {
      presentDates.add(record.date);
    } else if (record.present === false) {
      absentDates.add(record.date);
    } else {
      offDates.add(record.date);
    }
  });

  const presentDateObjects = Array.from(presentDates).map(d => new Date(d));
  const absentDateObjects = Array.from(absentDates).map(d => new Date(d));
  const offDateObjects = Array.from(offDates).map(d => new Date(d));

  // Get selected date info
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedDayName = selectedDate ? DAYS[selectedDate.getDay()] : null;
  
  // Get timetable entries for the selected day and this subject
  const dayEntries = selectedDayName 
    ? timetable.filter(t => t.day === selectedDayName && t.subjectId === subject.id)
    : [];

  // Get existing records for selected date
  const selectedDateRecords = selectedDateStr 
    ? subjectRecords.filter(r => r.date === selectedDateStr)
    : [];

  const handleMarkAttendance = (entry: TimetableEntry, present: boolean | null) => {
    if (!selectedDateStr) return;
    
    const existingRecord = subjectRecords.find(
      r => r.timetableEntryId === entry.id && r.date === selectedDateStr
    );

    if (existingRecord) {
      onEditAttendance(subject.id, entry.id, selectedDateStr, present);
    } else {
      onMarkAttendanceForDate(subject.id, entry.id, selectedDateStr, present);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {subject.name} - Attendance Calendar
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{subject.code}</p>
        </DialogHeader>

        <div className="mt-4 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              present: presentDateObjects,
              absent: absentDateObjects,
              off: offDateObjects,
            }}
            modifiersStyles={{
              present: {
                backgroundColor: '#22c55e',
                color: 'white',
                fontWeight: 'bold',
              },
              absent: {
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: 'bold',
              },
              off: {
                backgroundColor: '#6b7280',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">Off</span>
          </div>
        </div>

        {selectedDate && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium text-sm">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h4>
            
            {dayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No {subject.name} class scheduled for this day
              </p>
            ) : (
              dayEntries.map(entry => {
                const record = subjectRecords.find(
                  r => r.timetableEntryId === entry.id && r.date === selectedDateStr
                );
                const isMarked = !!record;

                return (
                  <div key={entry.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Time: {entry.time}</span>
                      {record && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          record.present === true ? 'bg-success/20 text-success' :
                          record.present === false ? 'bg-destructive/20 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {record.present === true ? 'Present' : record.present === false ? 'Absent' : 'Off'}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => handleMarkAttendance(entry, true)}
                        className={`${
                          record?.present === true 
                            ? 'bg-success text-white hover:bg-success/90' 
                            : 'border-success/30 text-success hover:bg-success/10'
                        }`}
                        size="sm"
                        variant={record?.present === true ? "default" : "outline"}
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Present
                      </Button>
                      <Button
                        onClick={() => handleMarkAttendance(entry, false)}
                        className={`${
                          record?.present === false 
                            ? 'bg-destructive text-white hover:bg-destructive/90' 
                            : 'border-destructive/30 text-destructive hover:bg-destructive/10'
                        }`}
                        variant={record?.present === false ? "default" : "outline"}
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Absent
                      </Button>
                      <Button
                        onClick={() => handleMarkAttendance(entry, null)}
                        className={`${
                          record?.present === null
                            ? 'bg-muted text-foreground hover:bg-muted/80' 
                            : 'border-muted text-muted-foreground hover:bg-muted/30'
                        }`}
                        variant={record?.present === null ? "default" : "outline"}
                        size="sm"
                      >
                        <MinusCircle className="h-4 w-4 mr-1.5" />
                        Off
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {isMarked ? "Click to edit attendance" : "Mark attendance for this class"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
