import { useTheme } from "next-themes";
import { AnimatedBackground3D } from "@/components/AnimatedBackground3D";

interface DashboardContentProps {
  children: React.ReactNode;
}

export const DashboardContent = ({ children }: DashboardContentProps) => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-8 relative overflow-hidden">
      <AnimatedBackground3D variant={theme === 'vibrant' ? 'vibrant' : 'dashboard'} />
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
