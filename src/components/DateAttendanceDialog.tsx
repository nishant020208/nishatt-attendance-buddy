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
  onMarkAttendance: (subjectId: string, present: boolean) => void;
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
  onMarkAttendance
}: DateAttendanceDialogProps) => {
  const dayName = DAYS[date.getDay()];
  const dateStr = format(date, "yyyy-MM-dd");
  const dayTimetable = timetable.filter(entry => entry.day === dayName).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {format(date, "PPP")} - {dayName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {dayTimetable.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No classes scheduled for this day
            </p>
          ) : (
            dayTimetable.map(entry => {
              const subject = subjects.find(s => s.id === entry.subjectId);
              const record = attendanceRecords.find(
                r => r.timetableEntryId === entry.id && r.date === dateStr
              );

              const getStatusDisplay = () => {
                if (!record) return null;
                if (record.present === true) return { icon: CheckCircle, text: "Present", color: "text-success" };
                if (record.present === false) return { icon: XCircle, text: "Absent", color: "text-destructive" };
                return { icon: MinusCircle, text: "Off", color: "text-muted-foreground" };
              };

              const status = getStatusDisplay();
              const isMarked = !!record;

              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm">{subject?.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{subject?.code}</span>
                      <span>•</span>
                      <span>{entry.time}</span>
                    </div>
                  </div>

                  {status && (
                    <div className="flex items-center gap-2 mb-3">
                      {status.icon && <status.icon className={`h-4 w-4 ${status.color}`} />}
                      <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => isMarked 
                        ? onEditAttendance(entry.subjectId, entry.id, dateStr, true)
                        : onMarkAttendance(entry.subjectId, true)
                      }
                      className={`flex-1 ${
                        record?.present === true 
                          ? 'bg-success hover:bg-success/90' 
                          : 'bg-success/20 hover:bg-success/30'
                      }`}
                      size="sm"
                      variant={record?.present === true ? "default" : "outline"}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      onClick={() => isMarked 
                        ? onEditAttendance(entry.subjectId, entry.id, dateStr, false)
                        : onMarkAttendance(entry.subjectId, false)
                      }
                      className={`flex-1 ${
                        record?.present === false 
                          ? 'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                          : 'border-destructive/50 text-destructive hover:bg-destructive/10'
                      }`}
                      variant="outline"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                    <Button
                      onClick={() => isMarked 
                        ? onEditAttendance(entry.subjectId, entry.id, dateStr, null)
                        : onMarkAttendance(entry.subjectId, false)
                      }
                      className={`flex-1 ${
                        record && record.present === null
                          ? 'bg-muted hover:bg-muted/80' 
                          : 'hover:bg-muted/50'
                      }`}
                      variant="outline"
                      size="sm"
                    >
                      <MinusCircle className="h-4 w-4 mr-1" />
                      Off
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};