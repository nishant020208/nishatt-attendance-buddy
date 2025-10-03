import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calendar, MinusCircle } from "lucide-react";
import { Subject, TimetableEntry, AttendanceRecord } from "@/types/attendance";
import { format } from "date-fns";

interface DailyAttendanceProps {
  subjects: Subject[];
  todayTimetable: TimetableEntry[];
  onMarkAttendance: (subjectId: string, present: boolean) => void;
  onEditAttendance: (subjectId: string, timetableEntryId: string, date: string, newPresent: boolean | null) => void;
  markedToday: string[];
  attendanceRecords: AttendanceRecord[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DailyAttendance = ({ subjects, todayTimetable, onMarkAttendance, onEditAttendance, markedToday, attendanceRecords }: DailyAttendanceProps) => {
  const today = format(new Date(), "EEEE");
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const sortedTimetable = todayTimetable.sort((a, b) => a.time.localeCompare(b.time));

  if (sortedTimetable.length === 0) {
    return (
      <Card className="p-8 text-center gradient-card border-0 shadow-lg">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Classes Today</h3>
        <p className="text-sm text-muted-foreground">
          Enjoy your day! You have no classes scheduled for {today}.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 gradient-card border-0 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-1">Today's Classes</h3>
        <p className="text-sm text-muted-foreground">{format(new Date(), "PPP")}</p>
      </div>

      <div className="space-y-3">
        {sortedTimetable.map(entry => {
          const subject = subjects.find(s => s.id === entry.subjectId);
          const isMarked = markedToday.includes(entry.id);
          const record = attendanceRecords.find(r => r.timetableEntryId === entry.id && r.date === todayDate);
          
          const getStatusDisplay = () => {
            if (!record) return null;
            if (record.present === true) return { icon: CheckCircle, text: "Present", color: "text-success", bgColor: "border-success bg-success/5" };
            if (record.present === false) return { icon: XCircle, text: "Absent", color: "text-destructive", bgColor: "border-destructive bg-destructive/5" };
            return { icon: MinusCircle, text: "Off", color: "text-muted-foreground", bgColor: "border-border bg-muted/5" };
          };

          const status = getStatusDisplay();

          return (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                status ? status.bgColor : 'border-border bg-card'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">{subject?.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{subject?.code}</span>
                    <span>•</span>
                    <span>{entry.time}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => isMarked 
                      ? onEditAttendance(entry.subjectId, entry.id, todayDate, true)
                      : onMarkAttendance(entry.subjectId, true)
                    }
                    className={`flex-1 sm:flex-none ${
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
                      ? onEditAttendance(entry.subjectId, entry.id, todayDate, false)
                      : onMarkAttendance(entry.subjectId, false)
                    }
                    className={`flex-1 sm:flex-none ${
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
                      ? onEditAttendance(entry.subjectId, entry.id, todayDate, null)
                      : onMarkAttendance(entry.subjectId, false)
                    }
                    className={`flex-1 sm:flex-none ${
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
            </div>
          );
        })}
      </div>
    </Card>
  );
};
