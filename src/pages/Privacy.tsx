import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Privacy = () => {
  return (
    <div className="min-h-screen gradient-mesh py-8 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Privacy Policy"
        description="Nishatt Attendance Buddy privacy disclosures: how attendance records, timetables, and student credentials are secured."
        canonical="/privacy"
      />

      <div className="max-w-3xl mx-auto">
        <PageBreadcrumb items={[{ label: "Legal", href: "/privacy" }, { label: "Privacy Policy" }]} />

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
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Privacy Policy
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your student privacy and schedule data protection commitment
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Overview</h2>
              <p>
                Nishatt Attendance Buddy is built to help college and university students track class attendance, compute safe leaves, and organize course timetables. We believe your academic records belong to you alone.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1.5 mt-1">
                <li><strong className="text-foreground">Authentication Details:</strong> Email address and hashed password credentials managed securely via Supabase Auth.</li>
                <li><strong className="text-foreground">Course Data:</strong> Subject names, codes, timetable slots, and target attendance percentages you choose to store.</li>
                <li><strong className="text-foreground">Attendance Logs:</strong> Daily timestamps indicating presence, absence, or class cancellations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. How Your Data Is Used</h2>
              <p>
                Your attendance information is strictly used to render real-time calculations, calculate classes needed for 75% targets, and visualize attendance trends. We do not sell, rent, or monetize your personal data to third parties or advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Storage & Security</h2>
              <p>
                All data in transit is encrypted using TLS 1.3. Persistent student data is secured with row-level security (RLS) policies in Supabase, ensuring only authenticated account holders can query or modify their records.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">5. Data Deletion</h2>
              <p>
                You may purge your local cache at any time by signing out, or request complete account deletion by contacting support at <a href="mailto:support@nishatt.com" className="text-primary hover:underline">support@nishatt.com</a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
