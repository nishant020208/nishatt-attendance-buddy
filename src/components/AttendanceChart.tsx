import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Subject } from "@/types/attendance";

interface AttendanceChartProps {
  subjects: Subject[];
}

export const AttendanceChart = ({ subjects }: AttendanceChartProps) => {
  const data = subjects.map(subject => ({
    name: subject.code,
    percentage: subject.totalClasses > 0 
      ? ((subject.attended / subject.totalClasses) * 100).toFixed(1)
      : 0,
    attended: subject.attended,
    total: subject.totalClasses,
  }));

  return (
    <Card className="p-6 gradient-card border-0 shadow-lg animate-in">
      <h3 className="text-lg font-semibold mb-6">Attendance Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            activeDot={{ r: 7 }}
            name="Attendance %"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Target: 75% minimum attendance</span>
        </div>
      </div>
    </Card>
  );
};
