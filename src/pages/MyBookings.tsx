import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TechnicianTracker } from "@/components/tracking/TechnicianTracker";
import CommunicationPanel from "@/components/communication/CommunicationPanel";
import WhatsAppShare from "@/components/shared/WhatsAppShare";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  MessageCircle,
  Navigation,
  CheckCircle,
  XCircle,
  Loader2,
  Truck,
  Home,
  Wrench,
} from "lucide-react";

interface Booking {
  id: string;
  service_name: string;
  service_category: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  amount: number | null;
  payment_status: string | null;
  customer_name: string;
  customer_phone: string;
  technician_id: string | null;
  technician_location_lat: number | null;
  technician_location_lng: number | null;
  estimated_arrival_time: string | null;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: "Confirmed", color: "bg-blue-500", icon: <CheckCircle className="h-4 w-4" /> },
  technician_assigned: { label: "Technician Assigned", color: "bg-indigo-500", icon: <User className="h-4 w-4" /> },
  on_the_way: { label: "On The Way", color: "bg-purple-500", icon: <Truck className="h-4 w-4" /> },
  arrived: { label: "Arrived", color: "bg-teal-500", icon: <Home className="h-4 w-4" /> },
  in_progress: { label: "In Progress", color: "bg-orange-500", icon: <Wrench className="h-4 w-4" /> },
  completed: { label: "Completed", color: "bg-green-500", icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
};

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
      subscribeToBookings();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Please login",
        description: "You need to login to view your bookings",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    setUser(session.user);
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToBookings = () => {
    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setBookings((prev) =>
              prev.map((booking) =>
                booking.id === payload.new.id ? (payload.new as Booking) : booking
              )
            );
            
            const newStatus = (payload.new as Booking).status;
            const config = statusConfig[newStatus];
            if (config) {
              toast({
                title: "Booking Updated",
                description: `Your booking status is now: ${config.label}`,
              });
            }
          } else if (payload.eventType === "INSERT") {
            setBookings((prev) => [payload.new as Booking, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openWhatsApp = (phone: string, serviceName: string) => {
    const message = encodeURIComponent(`Hi, I have a query about my ${serviceName} booking.`);
    window.open(`https://wa.me/91${phone.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  const getStatusProgress = (status: string) => {
    const statuses = ["pending", "confirmed", "technician_assigned", "on_the_way", "arrived", "in_progress", "completed"];
    const index = statuses.indexOf(status);
    return ((index + 1) / statuses.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Track your service bookings in real-time</p>
        </div>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-6">You haven't made any bookings yet.</p>
              <Button onClick={() => navigate("/services")}>Book a Service</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.pending;
              const isActive = !["completed", "cancelled"].includes(booking.status);

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{booking.service_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{booking.service_category}</p>
                      </div>
                      <Badge className={`${status.color} text-white flex items-center gap-1.5 px-3 py-1`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Progress Bar for Active Bookings */}
                    {isActive && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-primary">{Math.round(getStatusProgress(booking.status))}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${getStatusProgress(booking.status)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Real-time Technician Tracking */}
                    {["technician_assigned", "on_the_way", "arrived", "in_progress"].includes(booking.status) && (
                      <TechnicianTracker bookingId={booking.id} />
                    )}

                    {/* Booking Details */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Scheduled</p>
                          <p className="font-medium text-foreground">
                            {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium text-foreground">
                            {booking.address}, {booking.city}
                          </p>
                        </div>
                      </div>

                      {booking.amount && (
                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 text-muted-foreground mt-0.5 font-bold">₹</div>
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-medium text-foreground">₹{booking.amount}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-medium text-foreground">{booking.customer_phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      <CommunicationPanel
                        bookingId={booking.id}
                        userId={user?.id}
                        userRole="customer"
                        otherPartyName="Technician"
                        otherPartyId={booking.technician_id || undefined}
                      />

                      <WhatsAppShare
                        serviceName={booking.service_name}
                        status={statusConfig[booking.status]?.label || booking.status}
                        scheduledDate={booking.scheduled_date}
                        scheduledTime={booking.scheduled_time}
                        bookingId={booking.id}
                      />

                      {isActive && booking.status !== "in_progress" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
