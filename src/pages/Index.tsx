import { DashboardHeader } from "@/components/DashboardHeader";
import { OverallStats } from "@/components/OverallStats";
import { SubjectCard } from "@/components/SubjectCard";
import { AttendanceChart } from "@/components/AttendanceChart";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { useAttendance } from "@/hooks/useAttendance";
import { ThemeProvider } from "next-themes";

const Index = () => {
  const { 
    subjects, 
    markAttendance, 
    calculateOverallStats,
    getAttendanceDates 
  } = useAttendance();

  const stats = calculateOverallStats();
  const attendanceDates = getAttendanceDates();

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back, Student!</h2>
            <p className="text-muted-foreground">
              Track your attendance and stay on top of your academic goals
            </p>
          </div>

          <div className="space-y-8">
            <OverallStats {...stats} />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Your Subjects</h3>
                  <div className="grid gap-4">
                    {subjects.map(subject => (
                      <SubjectCard
                        key={subject.id}
                        subject={subject}
                        onMarkAttendance={markAttendance}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <AttendanceCalendar attendanceDates={attendanceDates} />
                <AttendanceChart subjects={subjects} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
