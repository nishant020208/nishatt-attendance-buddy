import { Card } from "@/components/ui/card";
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface OverallStatsProps {
  totalPercentage: number;
  classesAttended: number;
  totalClasses: number;
  canMiss: number;
}

export const OverallStats = ({ 
  totalPercentage, 
  classesAttended, 
  totalClasses,
  canMiss 
}: OverallStatsProps) => {
  const getStatusColor = () => {
    if (totalPercentage >= 85) return "text-success";
    if (totalPercentage >= 75) return "text-warning";
    return "text-destructive";
  };

  const getStatusBg = () => {
    if (totalPercentage >= 85) return "gradient-success";
    if (totalPercentage >= 75) return "gradient-warning";
    return "bg-destructive";
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 animate-in">
      <Card className="p-6 gradient-card border-0 shadow-lg hover:shadow-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Overall Attendance</h3>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div className={`text-4xl font-bold ${getStatusColor()} mb-2`}>
          {totalPercentage.toFixed(1)}%
        </div>
        <p className="text-sm text-muted-foreground">
          {classesAttended} / {totalClasses} classes attended
        </p>
      </Card>

      <Card className="p-6 gradient-card border-0 shadow-lg hover:shadow-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Classes You Can Miss</h3>
          {totalPercentage >= 75 ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}
        </div>
        <div className={`text-4xl font-bold ${canMiss > 0 ? 'text-success' : 'text-destructive'} mb-2`}>
          {canMiss}
        </div>
        <p className="text-sm text-muted-foreground">
          {canMiss > 0 
            ? "While maintaining 75% attendance" 
            : "You need to attend more classes!"}
        </p>
      </Card>

      <Card className={`p-6 border-0 shadow-lg hover:shadow-glow transition-all duration-300 ${getStatusBg()}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/90">Status</h3>
        </div>
        <div className="text-2xl font-bold text-white mb-2">
          {totalPercentage >= 85 ? "Excellent!" : totalPercentage >= 75 ? "Good" : "Critical"}
        </div>
        <p className="text-sm text-white/80">
          {totalPercentage >= 85 
            ? "Keep up the great work!" 
            : totalPercentage >= 75 
            ? "Stay consistent to maintain 75%" 
            : "Attend more classes urgently"}
        </p>
      </Card>
    </div>
  );
};
