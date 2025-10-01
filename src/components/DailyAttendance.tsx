import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { Subject, TimetableEntry } from "@/types/attendance";
import { format } from "date-fns";

interface DailyAttendanceProps {
  subjects: Subject[];
  todayTimetable: TimetableEntry[];
  onMarkAttendance: (subjectId: string, present: boolean) => void;
  markedToday: string[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DailyAttendance = ({ subjects, todayTimetable, onMarkAttendance, markedToday }: DailyAttendanceProps) => {
  const today = format(new Date(), "EEEE");
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

          return (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isMarked 
                  ? 'border-success bg-success/5' 
                  : 'border-border bg-card'
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

                {isMarked ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Marked</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onMarkAttendance(entry.subjectId, true)}
                      className="flex-1 sm:flex-none bg-success hover:bg-success/90"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      onClick={() => onMarkAttendance(entry.subjectId, false)}
                      variant="outline"
                      className="flex-1 sm:flex-none border-destructive/50 text-destructive hover:bg-destructive/10"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
