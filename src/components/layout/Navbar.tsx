import { useState, useEffect } from "react";
import helprLogo from "@/assets/helpr-logo-orange.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, User, Calendar, LogOut, Shield, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase.
    from("user_roles").
    select("role").
    eq("user_id", userId);
    const roles = data?.map((r) => r.role) ?? [];
    // Auto-assign customer role if user has no roles
    if (roles.length === 0) {
      await supabase.
      from("user_roles").
      insert({ user_id: userId, role: "customer" as const });
      roles.push("customer");
    }
    setUserRoles(roles);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setTimeout(() => fetchRoles(session.user.id), 0);
        } else {
          setUserRoles([]);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) fetchRoles(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
      navigate("/");
    }
  };

  const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/my-bookings", label: "My Bookings" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }];


  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <img src={helprLogo} alt="HelpR Logo" className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
          <Link
            key={link.href}
            to={link.href}
            className={`text-sm font-medium transition-colors hover:text-primary ${
            isActive(link.href) ? "text-primary" : "text-muted-foreground"}`
            }>
            
              {link.label}
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+918919312594" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="h-4 w-4" />
            <span>+91 89193 12594</span>
          </a>
          <Link to="/become-helper" className="text-primary">
            <Button variant="outline" size="sm">
              Partner with us
            </Button>
          </Link>
          {loading ?
          <Button size="sm" disabled>
              <User className="h-4 w-4" />
              Loading...
            </Button> :
          user ?
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.email?.split('@')[0] || 'Account'}
                  {userRoles.includes('admin') ?
                <Badge className="ml-1 bg-destructive/90 text-destructive-foreground text-[10px] px-1.5 py-0">Admin</Badge> :
                userRoles.includes('technician') ?
                <Badge className="ml-1 bg-accent text-accent-foreground text-[10px] px-1.5 py-0">Helper</Badge> :

                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">Customer</Badge>
                }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {userRoles.includes('admin') ? '🛡️ Admin Account' : userRoles.includes('technician') ? '🔧 Helper Account' : '👤 Customer Account'}
                </div>
                <DropdownMenuSeparator />
                {userRoles.includes('admin') &&
              <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
              }
                {userRoles.includes('technician') &&
              <DropdownMenuItem asChild>
                    <Link to="/technician-dashboard" className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Helper Dashboard
                    </Link>
                  </DropdownMenuItem>
              }
                <DropdownMenuItem asChild>
                  <Link to="/my-bookings" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> :

          <Link to="/login">
              <Button size="sm">
                <User className="h-4 w-4" />
                Login
              </Button>
            </Link>
          }
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}>
          
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen &&
      <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 space-y-4">
            {navLinks.map((link) =>
          <Link
            key={link.href}
            to={link.href}
            onClick={() => setIsOpen(false)}
            className={`block py-2 text-base font-medium transition-colors ${
            isActive(link.href) ? "text-primary" : "text-muted-foreground"}`
            }>
            
                {link.label}
              </Link>
          )}
            <div className="pt-4 border-t border-border space-y-3">
              <Link to="/become-helper" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Partner with us
                </Button>
              </Link>
              {user ?
            <>
                  <div className="text-xs text-muted-foreground px-1 pb-1">
                    {userRoles.includes('admin') ? '🛡️ Admin Account' : userRoles.includes('technician') ? '🔧 Helper Account' : '👤 Customer Account'}
                  </div>
                  {userRoles.includes('admin') &&
              <Link to="/admin/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Button>
                    </Link>
              }
                  {userRoles.includes('technician') &&
              <Link to="/technician-dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <Wrench className="h-4 w-4" />
                        Helper Dashboard
                      </Button>
                    </Link>
              }
                  <Link to="/my-bookings" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4" />
                      My Bookings
                    </Button>
                  </Link>
                  <Button
                className="w-full"
                variant="destructive"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}>
                
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </> :

            <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">
                    <User className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
            }
            </div>
          </div>
        </div>
      }
    </nav>);

};

export default Navbar;