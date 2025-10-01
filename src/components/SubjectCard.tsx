import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Subject } from "@/types/attendance";

interface SubjectCardProps {
  subject: Subject;
  onMarkAttendance: (subjectId: string, present: boolean) => void;
}

export const SubjectCard = ({ subject, onMarkAttendance }: SubjectCardProps) => {
  const percentage = subject.totalClasses > 0 
    ? (subject.attended / subject.totalClasses) * 100 
    : 0;

  const getStatusColor = () => {
    if (percentage >= 85) return "text-success";
    if (percentage >= 75) return "text-warning";
    return "text-destructive";
  };

  const getStatusBadge = () => {
    if (percentage >= 85) return "bg-success/10 text-success hover:bg-success/20";
    if (percentage >= 75) return "bg-warning/10 text-warning hover:bg-warning/20";
    return "bg-destructive/10 text-destructive hover:bg-destructive/20";
  };

  return (
    <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{subject.name}</h3>
          <p className="text-sm text-muted-foreground">{subject.code}</p>
        </div>
        <Badge className={getStatusBadge()}>
          {percentage >= 75 ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {percentage.toFixed(1)}%
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Attended</span>
          <span className="font-medium">{subject.attended} / {subject.totalClasses}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              percentage >= 85 ? 'bg-success' : 
              percentage >= 75 ? 'bg-warning' : 
              'bg-destructive'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onMarkAttendance(subject.id, true)}
          className="flex-1 bg-success hover:bg-success/90"
          size="sm"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Present
        </Button>
        <Button
          onClick={() => onMarkAttendance(subject.id, false)}
          variant="outline"
          className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
          size="sm"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Absent
        </Button>
      </div>
    </Card>
  );
};
