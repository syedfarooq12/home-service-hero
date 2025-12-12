import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, ArrowRight, Shield, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleData) {
          navigate("/admin/dashboard");
        }
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
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

    setLoading(true);
    try {
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

      // Check if user has admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "This account does not have admin privileges.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome Back!",
        description: "Redirecting to admin dashboard...",
      });
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
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
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-4">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Admin Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Admin Login
              </h1>
              <p className="text-muted-foreground">
                Sign in to manage the platform
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-6 pl-10"
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

              <Button
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="w-full py-6 text-lg"
              >
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure admin access only</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLogin;
