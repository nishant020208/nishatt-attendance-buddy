import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Target, Bell, BellOff, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Subject } from "@/types/attendance";
import { toast } from "sonner";

interface AttendanceGoalsProps {
  subjects: Subject[];
  overallPercentage: number;
}

interface Goal {
  targetPercentage: number;
  notificationsEnabled: boolean;
  lastNotified: string | null;
}

const STORAGE_KEY = "attendance_goals";

export const AttendanceGoals = ({ subjects, overallPercentage }: AttendanceGoalsProps) => {
  const [goal, setGoal] = useState<Goal>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading goals:", e);
    }
    return {
      targetPercentage: 75,
      notificationsEnabled: true,
      lastNotified: null,
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState(goal.targetPercentage);

  // Save goal to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
    } catch (e) {
      console.error("Error saving goals:", e);
    }
  }, [goal]);

  // Check and notify if falling behind
  useEffect(() => {
    if (!goal.notificationsEnabled) return;
    
    const today = new Date().toDateString();
    
    // Only notify once per day
    if (goal.lastNotified === today) return;
    
    // Check overall attendance
    if (overallPercentage < goal.targetPercentage && overallPercentage > 0) {
      const deficit = goal.targetPercentage - overallPercentage;
      toast.warning(`⚠️ Attendance Alert`, {
        description: `You're ${deficit.toFixed(1)}% below your goal of ${goal.targetPercentage}%`,
        duration: 10000,
      });
      
      setGoal(prev => ({ ...prev, lastNotified: today }));
    }
    
    // Check individual subjects
    subjects.forEach(subject => {
      const percentage = subject.totalClasses > 0 
        ? (subject.attended / subject.totalClasses) * 100 
        : 0;
      
      if (percentage < goal.targetPercentage && percentage > 0 && subject.totalClasses >= 3) {
        toast.warning(`📚 ${subject.name}`, {
          description: `Attendance at ${percentage.toFixed(1)}% - below your ${goal.targetPercentage}% goal`,
          duration: 8000,
        });
      }
    });
  }, [subjects, overallPercentage, goal.notificationsEnabled, goal.targetPercentage, goal.lastNotified]);

  const handleSaveGoal = () => {
    setGoal(prev => ({ ...prev, targetPercentage: tempTarget, lastNotified: null }));
    setIsEditing(false);
    toast.success("Goal updated!", {
      description: `New target: ${tempTarget}% attendance`,
    });
  };

  const toggleNotifications = () => {
    setGoal(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
    toast.info(goal.notificationsEnabled ? "Notifications disabled" : "Notifications enabled");
  };

  const progressToGoal = Math.min((overallPercentage / goal.targetPercentage) * 100, 100);
  const isOnTrack = overallPercentage >= goal.targetPercentage;
  const gapToGoal = goal.targetPercentage - overallPercentage;

  // Count subjects meeting the goal
  const subjectsMeetingGoal = subjects.filter(s => {
    const pct = s.totalClasses > 0 ? (s.attended / s.totalClasses) * 100 : 100;
    return pct >= goal.targetPercentage;
  }).length;

  // Count subjects at risk
  const subjectsAtRisk = subjects.filter(s => {
    const pct = s.totalClasses > 0 ? (s.attended / s.totalClasses) * 100 : 100;
    return pct < goal.targetPercentage && pct > 0;
  });

  return (
    <Card className="p-4 sm:p-6 gradient-card border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Attendance Goal
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleNotifications}
          className="h-8 w-8"
        >
          {goal.notificationsEnabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Target Attendance: {tempTarget}%
            </Label>
            <Slider
              value={[tempTarget]}
              onValueChange={([value]) => setTempTarget(value)}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveGoal} size="sm" className="flex-1">
              Save Goal
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">{goal.targetPercentage}%</p>
              <p className="text-xs text-muted-foreground">Target Attendance</p>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit Goal
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Goal</span>
              <span className={isOnTrack ? "text-success" : "text-warning"}>
                {overallPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={progressToGoal} className="h-2" />
          </div>

          <div className={`p-3 rounded-lg ${isOnTrack ? 'bg-success/10' : 'bg-warning/10'} border ${isOnTrack ? 'border-success/20' : 'border-warning/20'}`}>
            <div className="flex items-center gap-2">
              {isOnTrack ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">You're on track!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium text-warning">
                    {gapToGoal.toFixed(1)}% below goal
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-2xl font-bold text-success">{subjectsMeetingGoal}</p>
              <p className="text-xs text-muted-foreground">Subjects on track</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-2xl font-bold text-warning">{subjectsAtRisk.length}</p>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </div>
          </div>

          {subjectsAtRisk.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Subjects needing attention:</p>
              <div className="space-y-1">
                {subjectsAtRisk.slice(0, 3).map(subject => {
                  const pct = subject.totalClasses > 0 
                    ? (subject.attended / subject.totalClasses) * 100 
                    : 0;
                  return (
                    <div key={subject.id} className="flex justify-between items-center text-xs p-2 bg-muted/30 rounded">
                      <span className="truncate flex-1">{subject.name}</span>
                      <span className="text-destructive font-medium ml-2">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
                {subjectsAtRisk.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{subjectsAtRisk.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
