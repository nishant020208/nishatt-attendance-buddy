import { Card } from "@/components/ui/card";
import { BookOpen, Calendar, TrendingUp } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-6 sm:p-8 gradient-card border-0 shadow-glow text-center">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Welcome to Nishatt!</h2>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          Your personal attendance companion. Get started in three easy steps:
        </p>

        <div className="grid gap-4 sm:gap-6 text-left">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Add Your Subjects</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Click "Add Subject" to create your subject list
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Build Your Timetable</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Add subjects to your weekly schedule
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Track Daily Attendance</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Mark your attendance and monitor your progress
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
