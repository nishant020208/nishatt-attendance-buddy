import { Link, useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Compass, Home, LogIn, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <SEO
        title="404 - Page Not Found"
        description="The page you requested could not be found. Navigate back to your student dashboard or timetable schedule."
        canonical="/404"
      />

      <div className="max-w-md w-full">
        <PageBreadcrumb items={[{ label: "404 Not Found" }]} />

        <Card className="gradient-card border-border/50 shadow-2xl p-6 sm:p-8 text-center backdrop-blur-xl">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Compass className="h-8 w-8 text-white animate-spin-slow" />
          </div>

          <span className="text-xs uppercase tracking-widest text-primary font-semibold block mb-1">
            Status Code 404
          </span>
          <h1 className="text-3xl font-bold tracking-tight mb-3 text-foreground">
            Page Not Found
          </h1>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            The path <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-foreground">{location.pathname}</code> does not exist or may have been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button asChild className="gradient-primary text-white shadow-glow">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Student Portal
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground flex justify-center gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-foreground transition-colors underline">
              Terms of Service
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
