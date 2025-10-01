import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface AttendanceCalendarProps {
  attendanceDates: Date[];
}

export const AttendanceCalendar = ({ attendanceDates }: AttendanceCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

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
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            attended: attendanceDates,
          }}
          modifiersStyles={{
            attended: {
              backgroundColor: 'hsl(var(--success))',
              color: 'white',
              fontWeight: 'bold',
            },
          }}
        />
      </div>

      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Attended</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <span className="text-sm text-muted-foreground">Not marked</span>
        </div>
      </div>

      {date && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg">
          <p className="text-sm font-medium">
            Selected: {format(date, "PPP")}
          </p>
        </div>
      )}
    </Card>
  );
};
