import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Terms = () => {
  return (
    <div className="min-h-screen gradient-mesh py-8 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Terms of Service"
        description="Terms of service and usage conditions for Nishatt Attendance Buddy."
        canonical="/terms"
      />

      <div className="max-w-3xl mx-auto">
        <PageBreadcrumb items={[{ label: "Legal", href: "/terms" }, { label: "Terms of Service" }]} />

        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Dashboard
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">Effective: September 2026</span>
        </div>

        <Card className="gradient-card border-border/50 shadow-xl backdrop-blur-xl">
          <CardHeader className="border-b border-border/40 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Terms of Service
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Guidelines and conditions for using Nishatt Attendance Buddy
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Agreement to Terms</h2>
              <p>
                By accessing or using Nishatt Attendance Buddy (https://attendance.nishatt.com), you agree to abide by these terms and conditions. If you disagree with any portion, please cease use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Intended Usage</h2>
              <p>
                This application is provided as an academic organization and planning aid for individual students. Calculations (such as safe absences to maintain a 75% threshold) are estimates based on user-entered timetables and may differ from official university registrar portals.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. User Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all actions taken under your authenticated session.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Disclaimer of Warranties</h2>
              <p>
                The platform is provided "as is" and "as available". Nishatt Attendance Solutions makes no warranties regarding uninterrupted availability or exact synchronization with external college administrative systems.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">5. Contact Information</h2>
              <p>
                For questions regarding these terms, contact us at <a href="mailto:support@nishatt.com" className="text-primary hover:underline">support@nishatt.com</a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
