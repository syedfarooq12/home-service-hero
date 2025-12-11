import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Clock, CheckCircle, LogOut, RefreshCw } from "lucide-react";

const TechnicianKYCPending = () => {
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>("submitted");
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/technician/login");
      return;
    }

    const { data: profile } = await supabase
      .from("technician_profiles")
      .select("kyc_status")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (profile) {
      setKycStatus(profile.kyc_status);
      if (profile.kyc_status === "approved") {
        navigate("/technician-dashboard");
      } else if (profile.kyc_status === "rejected") {
        navigate("/technician/kyc");
      }
    } else {
      navigate("/technician/kyc");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await checkStatus();
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/technician/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            {/* Animated Clock Icon */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute w-24 h-24 rounded-full bg-accent/10 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                <Clock className="w-10 h-10 text-accent" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Application Under Review
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for submitting your KYC application. Our team is reviewing your documents 
              and will notify you once approved.
            </p>

            {/* Status Timeline */}
            <div className="bg-secondary/50 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Documents Submitted</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent animate-pulse flex items-center justify-center">
                    <Clock className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Under Review</p>
                    <p className="text-xs text-muted-foreground">Usually takes 24-48 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-muted-foreground">Verification Complete</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleRefresh}
                disabled={loading}
                className="w-full bg-gradient-accent hover:opacity-90"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Check Status
              </Button>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@helpr.com" className="text-accent hover:underline">
              support@helpr.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TechnicianKYCPending;