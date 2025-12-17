import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, ArrowRight, Shield, Eye, EyeOff, Wrench } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const TechnicianLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkTechnicianStatus(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkTechnicianStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkTechnicianStatus = async (userId: string) => {
    // Check if user has technician role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "technician")
      .maybeSingle();

    if (roleData) {
      // Check KYC status
      const { data: profileData } = await supabase
        .from("technician_profiles")
        .select("kyc_status")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profileData || profileData.kyc_status === "pending") {
        navigate("/technician/kyc");
      } else if (profileData.kyc_status === "submitted") {
        navigate("/technician/kyc-pending");
      } else if (profileData.kyc_status === "approved") {
        navigate("/technician-dashboard");
      } else if (profileData.kyc_status === "rejected") {
        navigate("/technician/kyc");
      }
    }
  };

  const handleEmailAuth = async () => {
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/technician/kyc`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("This email is already registered. Please sign in instead.");
          }
          throw error;
        }

        if (data.user) {
          // Add technician role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: data.user.id, role: "technician" });

          if (roleError) throw roleError;

          toast({
            title: "Account Created!",
            description: "Please complete your KYC verification.",
          });
          navigate("/technician/kyc");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password. Please try again.");
          }
          throw error;
        }

        // Check if user has technician role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "technician")
          .maybeSingle();

        if (!roleData) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "This account is not registered as a technician. Please sign up as a technician or use the customer login.",
            variant: "destructive",
          });
          return;
        }

        await checkTechnicianStatus(data.user.id);
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Sign Up Failed" : "Login Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            {/* Header with Technician Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent mb-4">
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">Technician Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isSignUp ? "Join as a Technician" : "Technician Login"}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp ? "Start earning with HelpR" : "Sign in to manage your jobs"}
              </p>
            </div>

            {/* Email Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-6 pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-6 pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="py-6"
                    disabled={loading}
                  />
                </div>
              )}

              <Button
                onClick={handleEmailAuth}
                disabled={loading || !email || !password || (isSignUp && !confirmPassword)}
                className="w-full py-6 text-lg bg-gradient-accent hover:opacity-90"
              >
                {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-accent hover:underline text-sm"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Verified technicians earn more</span>
              </div>
            </div>
          </div>

          {/* Customer Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Looking to book services?{" "}
            <a href="/login" className="text-primary hover:underline">Customer Login</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TechnicianLogin;