import { Card } from "@/components/ui/card";
import { Subject, TimetableEntry, AttendanceRecord } from "@/types/attendance";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { SubjectCalendarDialog } from "./SubjectCalendarDialog";

interface SubjectStatsProps {
  subject: Subject;
  timetable?: TimetableEntry[];
  attendanceRecords?: AttendanceRecord[];
  onEditAttendance?: (subjectId: string, timetableEntryId: string, date: string, newPresent: boolean | null) => void;
  onMarkAttendanceForDate?: (subjectId: string, timetableEntryId: string, date: string, present: boolean | null) => void;
}

export const SubjectStats = ({ 
  subject, 
  timetable = [], 
  attendanceRecords = [],
  onEditAttendance,
  onMarkAttendanceForDate
}: SubjectStatsProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Ensure attended doesn't exceed totalClasses (fix for stats bug)
  const safeAttended = Math.min(subject.attended, subject.totalClasses);
  const safeTotalClasses = Math.max(subject.totalClasses, 0);
  
  const percentage = safeTotalClasses > 0 
    ? (safeAttended / safeTotalClasses) * 100 
    : 0;

  const getStatusColor = () => {
    if (percentage >= 85) return "text-success";
    if (percentage >= 75) return "text-warning";
    return "text-destructive";
  };

  const getStatusBg = () => {
    if (percentage >= 85) return "bg-success/10 border-success/20";
    if (percentage >= 75) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  // Calculate how many classes can miss while maintaining 75%
  let canMiss = 0;
  if (percentage >= 75 && safeTotalClasses > 0) {
    let testAttended = safeAttended;
    let testTotal = safeTotalClasses;
    
    while ((testAttended / (testTotal + 1)) * 100 >= 75) {
      testTotal += 1;
      canMiss += 1;
    }
  }

  // Generate trend data for the graph
  const trendData = [];
  let currentAttended = 0;
  for (let i = 1; i <= safeTotalClasses; i++) {
    if (i <= safeAttended) {
      currentAttended++;
    }
    trendData.push({
      class: i,
      percentage: (currentAttended / i) * 100,
    });
  }

  return (
    <>
      <Card 
        className={`p-6 border-2 ${getStatusBg()} shadow-lg animate-in cursor-pointer hover:shadow-xl transition-all`}
        onClick={() => setCalendarOpen(true)}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{subject.name}</h3>
            <p className="text-sm text-muted-foreground">{subject.code}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            <Calendar className="h-3 w-3" />
            <span>View Calendar</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Attendance</p>
            <p className={`text-3xl font-bold ${getStatusColor()}`}>
              {percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {safeAttended} / {safeTotalClasses} classes
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Can Miss</p>
            <p className={`text-3xl font-bold ${canMiss > 0 ? 'text-success' : 'text-destructive'}`}>
              {canMiss}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              While maintaining 75%
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <div className="flex items-center gap-2">
              {percentage >= 75 ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <AlertCircle className="h-6 w-6 text-destructive" />
              )}
              <p className="text-xl font-semibold">
                {percentage >= 85 ? "Excellent" : percentage >= 75 ? "Good" : "Critical"}
              </p>
            </div>
          </div>
        </div>

        {safeTotalClasses > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Attendance Trend
            </h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="class" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '10px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '10px' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke={percentage >= 75 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {onEditAttendance && onMarkAttendanceForDate && (
        <SubjectCalendarDialog
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          subject={subject}
          timetable={timetable}
          attendanceRecords={attendanceRecords}
          onEditAttendance={onEditAttendance}
          onMarkAttendanceForDate={onMarkAttendanceForDate}
        />
      )}
    </>
  );
};
