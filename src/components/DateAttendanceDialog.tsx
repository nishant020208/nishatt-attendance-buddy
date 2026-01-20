import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { Subject, TimetableEntry, AttendanceRecord } from "@/types/attendance";
import { format } from "date-fns";

interface DateAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  subjects: Subject[];
  timetable: TimetableEntry[];
  attendanceRecords: AttendanceRecord[];
  onEditAttendance: (subjectId: string, timetableEntryId: string, date: string, newPresent: boolean | null) => void;
  onMarkAttendanceForDate: (subjectId: string, timetableEntryId: string, date: string, present: boolean | null) => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DateAttendanceDialog = ({
  open,
  onOpenChange,
  date,
  subjects,
  timetable,
  attendanceRecords,
  onEditAttendance,
  onMarkAttendanceForDate
}: DateAttendanceDialogProps) => {
  const dayName = DAYS[date.getDay()];
  const dateStr = format(date, "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");
  const isTodayOrFuture = dateStr >= today;
  const dayTimetable = timetable.filter(entry => entry.day === dayName).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {format(date, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {dayTimetable.length} {dayTimetable.length === 1 ? 'class' : 'classes'} scheduled
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {dayTimetable.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No classes scheduled for this day</p>
            </div>
          ) : (
            dayTimetable.map(entry => {
              const subject = subjects.find(s => s.id === entry.subjectId);
              if (!subject) return null; // Only show subjects that exist
              
              const record = attendanceRecords.find(
                r => r.timetableEntryId === entry.id && r.date === dateStr
              );

              const getStatusDisplay = () => {
                if (!record) return null;
                if (record.present === true) return { icon: CheckCircle, text: "Present", color: "text-success", bg: "bg-success/10" };
                if (record.present === false) return { icon: XCircle, text: "Absent", color: "text-destructive", bg: "bg-destructive/10" };
                return { icon: MinusCircle, text: "Holiday/Off", color: "text-muted-foreground", bg: "bg-muted/50" };
              };

              const status = getStatusDisplay();
              const isMarked = !!record;
              const isPast = dateStr < today;
              const canMark = true; // Users can mark attendance for any date (past, today, or future)

              return (
                <div
                  key={entry.id}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    status ? `${status.bg} border-border/50` : 'bg-card border-border'
                  }`}
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1">{subject.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">{subject.code}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {entry.time}
                          </span>
                        </div>
                      </div>
                      {status && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
                          <status.icon className={`h-3.5 w-3.5 ${status.color}`} />
                          <span className={`text-xs font-semibold ${status.color}`}>{status.text}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {canMark && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        {isMarked ? "Edit Attendance:" : "Mark Attendance:"}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => {
                            if (isMarked) {
                              onEditAttendance(entry.subjectId, entry.id, dateStr, true);
                            } else {
                              onMarkAttendanceForDate(entry.subjectId, entry.id, dateStr, true);
                            }
                          }}
                          className={`${
                            record?.present === true 
                              ? 'bg-success text-white hover:bg-success/90 border-success' 
                              : 'border-success/30 text-success hover:bg-success/10 hover:border-success'
                          }`}
                          size="sm"
                          variant={record?.present === true ? "default" : "outline"}
                        >
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Present
                        </Button>
                        <Button
                          onClick={() => {
                            if (isMarked) {
                              onEditAttendance(entry.subjectId, entry.id, dateStr, false);
                            } else {
                              onMarkAttendanceForDate(entry.subjectId, entry.id, dateStr, false);
                            }
                          }}
                          className={`${
                            record?.present === false 
                              ? 'bg-destructive text-white hover:bg-destructive/90 border-destructive' 
                              : 'border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive'
                          }`}
                          variant={record?.present === false ? "default" : "outline"}
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Absent
                        </Button>
                        <Button
                          onClick={() => {
                            if (isMarked) {
                              onEditAttendance(entry.subjectId, entry.id, dateStr, null);
                            } else {
                              onMarkAttendanceForDate(entry.subjectId, entry.id, dateStr, null);
                            }
                          }}
                          className={`${
                            record?.present === null
                              ? 'bg-muted text-foreground hover:bg-muted/80 border-muted' 
                              : 'border-muted text-muted-foreground hover:bg-muted/30 hover:border-muted'
                          }`}
                          variant={record?.present === null ? "default" : "outline"}
                          size="sm"
                        >
                          <MinusCircle className="h-4 w-4 mr-1.5" />
                          Off
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};