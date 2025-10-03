import { useEffect, useState } from "react";
import { format } from "date-fns";

interface AttendanceReminderProps {
  markedToday: string[];
  todayTimetableCount: number;
}

export const AttendanceReminder = ({ markedToday, todayTimetableCount }: AttendanceReminderProps) => {
  const [showReminder, setShowReminder] = useState(false);
  const allMarked = todayTimetableCount > 0 && markedToday.length === todayTimetableCount;

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Check if it's 6:30 PM IST (18:30)
    const checkTime = () => {
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();

      if (hours === 18 && minutes === 30 && !allMarked && todayTimetableCount > 0) {
        setShowReminder(true);
        
        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Attendance Reminder", {
            body: `You have ${todayTimetableCount - markedToday.length} classes left to mark attendance for today!`,
            icon: "/favicon.ico",
          });
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    checkTime(); // Check immediately

    return () => clearInterval(interval);
  }, [markedToday, todayTimetableCount, allMarked]);

  return (
    <div 
      className="fixed bottom-20 right-4 z-50 max-w-xs animate-in fade-in slide-in-from-bottom-4"
      style={{
        backgroundColor: 'hsl(var(--card))',
        border: '2px solid hsl(var(--primary))',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <p className="text-sm font-medium">
        {allMarked 
          ? "Everyday do better than yesterday 💪" 
          : "Fill your attendance of today 📝"}
      </p>
      {!allMarked && todayTimetableCount > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {todayTimetableCount - markedToday.length} class{todayTimetableCount - markedToday.length !== 1 ? 'es' : ''} left
        </p>
      )}
    </div>
  );
};
