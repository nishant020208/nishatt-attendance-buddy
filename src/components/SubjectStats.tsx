import { Card } from "@/components/ui/card";
import { Subject } from "@/types/attendance";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface SubjectStatsProps {
  subject: Subject;
}

export const SubjectStats = ({ subject }: SubjectStatsProps) => {
  const percentage = subject.totalClasses > 0 
    ? (subject.attended / subject.totalClasses) * 100 
    : 0;

  const getStatusColor = () => {
    if (percentage >= 85) return "text-success";
    if (percentage >= 75) return "text-warning";
    return "text-destructive";
  };

  const getStatusBg = () => {
    if (percentage >= 85) return "bg-success/10 border-success/20";
    if (percentage >= 75) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  // Calculate how many classes can miss while maintaining 75%
  let canMiss = 0;
  if (percentage >= 75 && subject.totalClasses > 0) {
    let testAttended = subject.attended;
    let testTotal = subject.totalClasses;
    
    while ((testAttended / (testTotal + 1)) * 100 >= 75) {
      testTotal += 1;
      canMiss += 1;
    }
  }

  // Generate trend data for the graph
  const trendData = [];
  let currentAttended = 0;
  for (let i = 1; i <= subject.totalClasses; i++) {
    if (i <= subject.attended) {
      currentAttended++;
    }
    trendData.push({
      class: i,
      percentage: (currentAttended / i) * 100,
    });
  }

  return (
    <Card className={`p-6 border-2 ${getStatusBg()} shadow-lg animate-in`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{subject.name}</h3>
        <p className="text-sm text-muted-foreground">{subject.code}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Attendance</p>
          <p className={`text-3xl font-bold ${getStatusColor()}`}>
            {percentage.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {subject.attended} / {subject.totalClasses} classes
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Can Miss</p>
          <p className={`text-3xl font-bold ${canMiss > 0 ? 'text-success' : 'text-destructive'}`}>
            {canMiss}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            While maintaining 75%
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <div className="flex items-center gap-2">
            {percentage >= 75 ? (
              <CheckCircle className="h-6 w-6 text-success" />
            ) : (
              <AlertCircle className="h-6 w-6 text-destructive" />
            )}
            <p className="text-xl font-semibold">
              {percentage >= 85 ? "Excellent" : percentage >= 75 ? "Good" : "Critical"}
            </p>
          </div>
        </div>
      </div>

      {subject.totalClasses > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Attendance Trend
          </h4>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="class" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '10px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '10px' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke={percentage >= 75 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
