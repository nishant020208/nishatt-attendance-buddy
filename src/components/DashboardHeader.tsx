import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const DashboardHeader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } else {
      // Clear any remaining localStorage data for security
      localStorage.removeItem('nishatt_subjects');
      localStorage.removeItem('nishatt_timetable');
      localStorage.removeItem('nishatt_attendance');
      
      toast({
        title: "Signed out",
        description: "You've been signed out successfully"
      });
      navigate("/auth");
    }
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-xl font-bold text-white">N</span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight block text-foreground">Nishatt</span>
            <span className="text-xs sm:text-sm text-muted-foreground block">Attendance Buddy</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/privacy"
            className="text-xs text-muted-foreground hover:text-foreground hidden md:inline-block transition-colors"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="text-xs text-muted-foreground hover:text-foreground hidden md:inline-block transition-colors"
          >
            Terms
          </Link>
          <div className="h-4 w-px bg-border hidden md:block" />
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
