import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { DashboardHeader } from "@/components/DashboardHeader";
import { OverallStats } from "@/components/OverallStats";
import { SubjectStats } from "@/components/SubjectStats";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { AttendanceStreak } from "@/components/AttendanceStreak";
import { AttendanceGoals } from "@/components/AttendanceGoals";
import { WeeklyReport } from "@/components/WeeklyReport";
import { AddSubjectDialog } from "@/components/AddSubjectDialog";
import { TimetableView } from "@/components/TimetableView";
import { DailyAttendance } from "@/components/DailyAttendance";
import { EmptyState } from "@/components/EmptyState";
import { useAttendance } from "@/hooks/useAttendance";
import { ThemeProvider } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TableIcon, TrendingUp, Clock, MessageSquare, Database, Target, FileText } from "lucide-react";
import { ChatTab } from "@/components/ChatTab";
import { TimetableCodeDialog } from "@/components/TimetableCodeDialog";
import { SubjectManagement } from "@/components/SubjectManagement";
import { DashboardContent } from "@/components/DashboardContent";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const { 
    subjects,
    timetable,
    attendanceRecords,
    addSubject,
    deleteSubject,
    addToTimetable,
    removeFromTimetable,
    markAttendance,
    markAttendanceForDate,
    editAttendance,
    getTodayTimetable,
    getMarkedToday,
    calculateOverallStats,
    importTimetable,
    loading: dataLoading,
  } = useAttendance();


  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.warn("Unhandled rejection caught:", event.reason);
      toast.error("An error occurred. Please try again.");
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    }).catch((error) => {
      console.error("Auth error:", error);
      setLoading(false);
      toast.error("Failed to check authentication");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading || dataLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" themes={['light', 'dark', 'vibrant']}>
        <div className="min-h-screen gradient-mesh flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!session) {
    return null;
  }

  const stats = calculateOverallStats();
  const todayTimetable = getTodayTimetable();
  const markedToday = getMarkedToday();

  if (subjects.length === 0) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" themes={['light', 'dark', 'vibrant']}>
        <SEO
          title="Get Started | Student Attendance Companion"
          description="Create your subjects, import timetables, and begin tracking class attendance to stay above the 75% threshold."
          canonical="/"
        />
        <DashboardContent>
          <DashboardHeader />
          <main className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
            <PageBreadcrumb items={[{ label: "Get Started" }]} />
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Get Started with Nishatt Attendance</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Add your first subject or import a timetable to begin tracking
                </p>
              </div>
              <div className="flex gap-2">
                <TimetableCodeDialog timetable={timetable} onImportTimetable={importTimetable} />
                <AddSubjectDialog onAddSubject={addSubject} />
              </div>
            </div>
            <EmptyState />
          </main>
        </DashboardContent>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" themes={['light', 'dark', 'vibrant']}>
      <SEO
        title="Student Attendance Dashboard"
        description="Monitor attendance percentage, calculate classes you can afford to miss, and view weekly timetable statistics."
        canonical="/"
      />
      <DashboardContent>
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
          <PageBreadcrumb items={[{ label: "Dashboard" }]} />
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Student Attendance Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track your attendance, manage daily lectures, and stay motivated
              </p>
            </div>
            <div className="flex gap-2">
              <TimetableCodeDialog timetable={timetable} onImportTimetable={importTimetable} />
              <AddSubjectDialog onAddSubject={addSubject} />
            </div>
          </div>

          <Tabs defaultValue="today" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 h-auto gap-1">
              <TabsTrigger value="today" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Clock className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Today</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Target className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <FileText className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Report</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <TrendingUp className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="timetable" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <TableIcon className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Timetable</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Calendar className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Database className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Subjects</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <MessageSquare className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              <AttendanceStreak attendanceRecords={attendanceRecords} />
              <DailyAttendance
                subjects={subjects}
                todayTimetable={todayTimetable}
                onMarkAttendance={markAttendance}
                onEditAttendance={editAttendance}
                markedToday={markedToday}
                attendanceRecords={attendanceRecords}
              />
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <AttendanceGoals 
                subjects={subjects}
                overallPercentage={stats.totalPercentage}
              />
            </TabsContent>

            <TabsContent value="report" className="space-y-6">
              <WeeklyReport
                subjects={subjects}
                timetable={timetable}
                attendanceRecords={attendanceRecords}
              />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <OverallStats {...stats} />
              <div className="space-y-6">
                {subjects
                  .filter(subject => timetable.some(t => t.subjectId === subject.id))
                  .map(subject => (
                    <SubjectStats 
                      key={subject.id} 
                      subject={subject}
                      timetable={timetable}
                      attendanceRecords={attendanceRecords}
                      onEditAttendance={editAttendance}
                      onMarkAttendanceForDate={markAttendanceForDate}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="timetable" className="space-y-6">
            <TimetableView 
              subjects={subjects}
              timetable={timetable}
              onAddToTimetable={addToTimetable}
              onRemoveFromTimetable={removeFromTimetable}
              onAddSubject={addSubject}
            />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <AttendanceCalendar 
                attendanceRecords={attendanceRecords} 
                subjects={subjects} 
                timetable={timetable}
                onEditAttendance={editAttendance}
                onMarkAttendanceForDate={markAttendanceForDate}
              />
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <SubjectManagement 
                subjects={subjects}
                onAddSubject={addSubject}
                onDeleteSubject={deleteSubject}
              />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <ChatTab 
                subjects={subjects} 
                timetable={timetable}
                onSubjectsExtracted={(extractedSubjects) => {
                  extractedSubjects.forEach(subject => {
                    const exists = subjects.find(s => s.code === subject.code);
                    if (!exists) {
                      addSubject(subject.name, subject.code);
                    }
                  });
                }}
                onTimetableExtracted={(entries) => {
                  entries.forEach(entry => {
                    const subject = subjects.find(s => s.code === entry.subjectCode);
                    if (subject) {
                      const isDuplicate = timetable.some(
                        t => t.day === entry.day && 
                             t.subjectId === subject.id && 
                             t.time === entry.time
                      );
                      if (!isDuplicate) {
                        addToTimetable(entry.day, subject.id, entry.time);
                      }
                    }
                  });
                }}
              />
            </TabsContent>
          </Tabs>

          <footer className="mt-12 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} Nishatt Attendance Buddy. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <a 
                href="https://github.com/nishant020208/nishatt-attendance-buddy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-foreground transition-colors"
              >
                GitHub Source
              </a>
            </div>
          </footer>
        </main>
      </DashboardContent>
    </ThemeProvider>
  );
};

export default Index;
