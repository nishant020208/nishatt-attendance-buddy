import { Card } from "@/components/ui/card";
import { Flame, Trophy, Star } from "lucide-react";
import { AttendanceRecord } from "@/types/attendance";
import { format, subDays, parseISO, startOfDay } from "date-fns";

interface AttendanceStreakProps {
  attendanceRecords: AttendanceRecord[];
}

export const AttendanceStreak = ({ attendanceRecords }: AttendanceStreakProps) => {
  // Calculate current streak of consecutive days with 100% attendance
  const calculateStreak = () => {
    // Group records by date
    const dateMap = new Map<string, { attended: number; total: number }>();
    
    attendanceRecords.forEach(record => {
      // Skip "Off" records (null present) as they don't count
      if (record.present === null) return;
      
      const existing = dateMap.get(record.date) || { attended: 0, total: 0 };
      existing.total++;
      if (record.present === true) existing.attended++;
      dateMap.set(record.date, existing);
    });

    // Get sorted unique dates with 100% attendance
    const perfectDates = Array.from(dateMap.entries())
      .filter(([_, value]) => value.total > 0 && value.attended === value.total)
      .map(([date]) => date)
      .sort((a, b) => b.localeCompare(a)); // Sort descending

    if (perfectDates.length === 0) return { current: 0, longest: 0 };

    // Calculate current streak (must include today or yesterday)
    let currentStreak = 0;
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    
    // Check if the most recent perfect day is today or yesterday
    const mostRecentPerfectDay = perfectDates[0];
    const isActive = mostRecentPerfectDay === today || mostRecentPerfectDay === yesterday;
    
    if (isActive) {
      let checkDate = parseISO(mostRecentPerfectDay);
      for (const dateStr of perfectDates) {
        const date = parseISO(dateStr);
        if (format(date, "yyyy-MM-dd") === format(checkDate, "yyyy-MM-dd")) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    const sortedAsc = [...perfectDates].sort((a, b) => a.localeCompare(b));
    
    for (const dateStr of sortedAsc) {
      const date = parseISO(dateStr);
      
      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const expectedDate = format(subDays(date, 1), "yyyy-MM-dd");
        if (format(lastDate, "yyyy-MM-dd") === expectedDate) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = date;
    }

    return { current: currentStreak, longest: longestStreak };
  };

  const { current, longest } = calculateStreak();

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🏆";
    if (streak >= 14) return "🔥";
    if (streak >= 7) return "⭐";
    if (streak >= 3) return "✨";
    return "💪";
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Legendary streak!";
    if (streak >= 14) return "On fire!";
    if (streak >= 7) return "Amazing week!";
    if (streak >= 3) return "Keep it up!";
    if (streak >= 1) return "Great start!";
    return "Start your streak today!";
  };

  return (
    <Card className="p-4 sm:p-6 gradient-card border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Attendance Streak
        </h3>
        <span className="text-2xl">{getStreakEmoji(current)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Current</span>
          </div>
          <p className="text-3xl font-bold text-orange-500">{current}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {current === 1 ? "day" : "days"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Best</span>
          </div>
          <p className="text-3xl font-bold text-yellow-500">{longest}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {longest === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{getStreakMessage(current)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Consecutive days with 100% attendance
        </p>
      </div>
    </Card>
  );
};
