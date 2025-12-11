import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Phone, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { z } from "zod";

const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid phone number with country code (e.g., +919876543210)");
const otpSchema = z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers");

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    const validation = phoneSchema.safeParse(phone);
    if (!validation.success) {
      toast({
        title: "Invalid Phone Number",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        throw error;
      }

      setStep("otp");
      setCountdown(60);
      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      console.error("OTP send error:", error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const validation = otpSchema.safeParse(otp);
    if (!validation.success) {
      toast({
        title: "Invalid OTP",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome to Helpr!",
        description: "You have successfully logged in.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("OTP verify error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      handleSendOTP();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-elegant p-8 border border-border/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {step === "phone" ? "Login to Helpr" : "Verify OTP"}
              </h1>
              <p className="text-muted-foreground">
                {step === "phone" 
                  ? "Enter your phone number to receive a verification code" 
                  : `We've sent a 6-digit code to ${phone}`}
              </p>
            </div>

            {/* Form */}
            {step === "phone" ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-4 pr-4 py-6 text-lg"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={loading || !phone}
                  className="w-full py-6 text-lg"
                  variant="hero"
                >
                  {loading ? "Sending..." : "Send OTP"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Enter 6-digit OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-2xl tracking-[0.5em] py-6"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-6 text-lg"
                  variant="hero"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                  <CheckCircle className="ml-2 w-5 h-5" />
                </Button>

                <div className="text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={countdown > 0}
                    className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                  }}
                  className="w-full text-center text-muted-foreground hover:text-foreground"
                >
                  ← Change phone number
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
