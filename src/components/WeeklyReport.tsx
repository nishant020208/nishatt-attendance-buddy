import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Subject, TimetableEntry, AttendanceRecord } from "@/types/attendance";
import { format, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calendar, TrendingUp, TrendingDown, Minus, BookOpen, Clock, AlertCircle } from "lucide-react";

interface WeeklyReportProps {
  subjects: Subject[];
  timetable: TimetableEntry[];
  attendanceRecords: AttendanceRecord[];
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const WeeklyReport = ({ subjects, timetable, attendanceRecords }: WeeklyReportProps) => {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  // Get records for this week and last week
  const thisWeekRecords = attendanceRecords.filter(r => {
    try {
      const date = parseISO(r.date);
      return isWithinInterval(date, { start: thisWeekStart, end: thisWeekEnd });
    } catch {
      return false;
    }
  });

  const lastWeekRecords = attendanceRecords.filter(r => {
    try {
      const date = parseISO(r.date);
      return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
    } catch {
      return false;
    }
  });

  // Calculate this week's stats
  const thisWeekPresent = thisWeekRecords.filter(r => r.present === true).length;
  const thisWeekAbsent = thisWeekRecords.filter(r => r.present === false).length;
  const thisWeekOff = thisWeekRecords.filter(r => r.present === null).length;
  const thisWeekTotal = thisWeekPresent + thisWeekAbsent;
  const thisWeekPercentage = thisWeekTotal > 0 ? (thisWeekPresent / thisWeekTotal) * 100 : 0;

  // Calculate last week's stats
  const lastWeekPresent = lastWeekRecords.filter(r => r.present === true).length;
  const lastWeekAbsent = lastWeekRecords.filter(r => r.present === false).length;
  const lastWeekTotal = lastWeekPresent + lastWeekAbsent;
  const lastWeekPercentage = lastWeekTotal > 0 ? (lastWeekPresent / lastWeekTotal) * 100 : 0;

  // Calculate trend
  const trend = thisWeekPercentage - lastWeekPercentage;

  // Daily breakdown for this week
  const daysOfWeek = eachDayOfInterval({ start: thisWeekStart, end: thisWeekEnd });
  const dailyData = daysOfWeek.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayRecords = thisWeekRecords.filter(r => r.date === dateStr);
    const present = dayRecords.filter(r => r.present === true).length;
    const absent = dayRecords.filter(r => r.present === false).length;
    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    
    return {
      day: DAYS_SHORT[day.getDay()],
      fullDate: dateStr,
      present,
      absent,
      total,
      percentage,
    };
  });

  // Subject breakdown for this week
  const subjectBreakdown = subjects.map(subject => {
    const subjectRecords = thisWeekRecords.filter(r => r.subjectId === subject.id);
    const present = subjectRecords.filter(r => r.present === true).length;
    const absent = subjectRecords.filter(r => r.present === false).length;
    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      present,
      absent,
      total,
      percentage,
    };
  }).filter(s => s.total > 0).sort((a, b) => b.percentage - a.percentage);

  // Best and worst performing days
  const bestDay = dailyData.filter(d => d.total > 0).sort((a, b) => b.percentage - a.percentage)[0];
  const worstDay = dailyData.filter(d => d.total > 0).sort((a, b) => a.percentage - b.percentage)[0];

  // Get color for percentage
  const getColor = (pct: number) => {
    if (pct >= 85) return "hsl(var(--success))";
    if (pct >= 75) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getBarColor = (pct: number) => {
    if (pct >= 85) return "#22c55e";
    if (pct >= 75) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 sm:p-6 gradient-card border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Report
          </h3>
          <Badge variant="outline" className="text-xs">
            {format(thisWeekStart, "MMM d")} - {format(thisWeekEnd, "MMM d")}
          </Badge>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
            <p className="text-2xl font-bold text-primary">{thisWeekPercentage.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : trend < 0 ? (
                <TrendingDown className="h-4 w-4 text-destructive" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={`text-2xl font-bold ${
                trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">vs Last Week</p>
          </div>
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-2xl font-bold text-success">{thisWeekPresent}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-2xl font-bold text-destructive">{thisWeekAbsent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
        </div>

        {/* Daily Chart */}
        {thisWeekTotal > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily Breakdown
            </h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyData}>
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(0)}%`, 'Attendance']}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {dailyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.total > 0 ? getBarColor(entry.percentage) : '#e5e7eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestDay && bestDay.total > 0 && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs font-medium text-success">Best Day</span>
              </div>
              <p className="text-sm font-semibold">{bestDay.day}</p>
              <p className="text-xs text-muted-foreground">{bestDay.percentage.toFixed(0)}% ({bestDay.present}/{bestDay.total})</p>
            </div>
          )}
          {worstDay && worstDay.total > 0 && worstDay.percentage < 100 && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-xs font-medium text-warning">Needs Improvement</span>
              </div>
              <p className="text-sm font-semibold">{worstDay.day}</p>
              <p className="text-xs text-muted-foreground">{worstDay.percentage.toFixed(0)}% ({worstDay.present}/{worstDay.total})</p>
            </div>
          )}
        </div>
      </Card>

      {/* Subject Breakdown */}
      {subjectBreakdown.length > 0 && (
        <Card className="p-4 sm:p-6 gradient-card border-0 shadow-lg">
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Subject Performance This Week
          </h4>
          <div className="space-y-3">
            {subjectBreakdown.map(subject => (
              <div key={subject.id} className="p-3 rounded-lg bg-muted/30 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">{subject.code}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className={`text-lg font-bold`} style={{ color: getColor(subject.percentage) }}>
                      {subject.percentage.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{subject.present}/{subject.total}</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ 
                      width: `${subject.percentage}%`,
                      backgroundColor: getColor(subject.percentage)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {thisWeekTotal === 0 && (
        <Card className="p-8 gradient-card border-0 shadow-lg text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No attendance data for this week yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start marking attendance to see your weekly report</p>
        </Card>
      )}
    </div>
  );
};
