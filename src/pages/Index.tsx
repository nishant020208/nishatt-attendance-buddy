import { DashboardHeader } from "@/components/DashboardHeader";
import { OverallStats } from "@/components/OverallStats";
import { SubjectStats } from "@/components/SubjectStats";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { AddSubjectDialog } from "@/components/AddSubjectDialog";
import { TimetableView } from "@/components/TimetableView";
import { DailyAttendance } from "@/components/DailyAttendance";
import { EmptyState } from "@/components/EmptyState";
import { useAttendance } from "@/hooks/useAttendance";
import { ThemeProvider } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TableIcon, TrendingUp, Clock, MessageSquare, Database } from "lucide-react";
import { ChatTab } from "@/components/ChatTab";
import { TimetableCodeDialog } from "@/components/TimetableCodeDialog";
import { SubjectManagement } from "@/components/SubjectManagement";

const Index = () => {
  const { 
    subjects,
    timetable,
    attendanceRecords,
    addSubject,
    deleteSubject,
    addToTimetable,
    removeFromTimetable,
    markAttendance,
    editAttendance,
    getTodayTimetable,
    getMarkedToday,
    calculateOverallStats,
    importTimetable,
  } = useAttendance();

  const stats = calculateOverallStats();
  const todayTimetable = getTodayTimetable();
  const markedToday = getMarkedToday();

  if (subjects.length === 0) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Get Started</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Add your first subject to begin tracking
                </p>
              </div>
              <AddSubjectDialog onAddSubject={addSubject} />
            </div>
            <EmptyState />
          </main>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-background gradient-mesh pb-20 sm:pb-8">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track your attendance and stay motivated
              </p>
            </div>
            <div className="flex gap-2">
              <TimetableCodeDialog timetable={timetable} onImportTimetable={importTimetable} />
              <AddSubjectDialog onAddSubject={addSubject} />
            </div>
          </div>

          <Tabs defaultValue="today" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 h-auto">
              <TabsTrigger value="today" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Clock className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Today</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="timetable" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <TableIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Timetable</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Database className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Subjects</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              <DailyAttendance
                subjects={subjects}
                todayTimetable={todayTimetable}
                onMarkAttendance={markAttendance}
                onEditAttendance={editAttendance}
                markedToday={markedToday}
                attendanceRecords={attendanceRecords}
              />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <OverallStats {...stats} />
              <div className="space-y-6">
                {subjects
                  .filter(subject => timetable.some(t => t.subjectId === subject.id))
                  .map(subject => (
                    <SubjectStats key={subject.id} subject={subject} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="timetable" className="space-y-6">
              <TimetableView
                subjects={subjects}
                timetable={timetable}
                onAddToTimetable={addToTimetable}
                onRemoveFromTimetable={removeFromTimetable}
              />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <AttendanceCalendar attendanceRecords={attendanceRecords} subjects={subjects} />
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <SubjectManagement 
                subjects={subjects}
                onAddSubject={addSubject}
                onDeleteSubject={deleteSubject}
              />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <ChatTab subjects={subjects} timetable={timetable} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
