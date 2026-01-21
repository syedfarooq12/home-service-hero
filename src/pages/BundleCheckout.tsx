import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Package, MapPin, Clock, Percent, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BundleItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

const DISCOUNT_PERCENTAGE = 10;

const timeSlots = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
];

const BundleCheckout = () => {
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load bundle from localStorage
    const savedBundle = localStorage.getItem("serviceBundle");
    if (savedBundle) {
      const items = JSON.parse(savedBundle);
      if (items.length < 2) {
        toast({
          title: "Bundle too small",
          description: "You need at least 2 services for a bundle booking.",
          variant: "destructive",
        });
        navigate("/services");
        return;
      }
      setBundleItems(items);
    } else {
      navigate("/services");
    }

    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setFormData((prev) => ({
          ...prev,
          customerEmail: session.user.email || "",
        }));
      }
    });
  }, [navigate, toast]);

  const totalOriginal = bundleItems.reduce((sum, item) => sum + item.price, 0);
  const discount = totalOriginal * (DISCOUNT_PERCENTAGE / 100);
  const totalDiscounted = totalOriginal - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to book a bundle.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!date || !selectedTime) {
      toast({
        title: "Select date and time",
        description: "Please select a date and time slot.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create bundle
      const { data: bundle, error: bundleError } = await supabase
        .from("service_bundles")
        .insert({
          user_id: user.id,
          bundle_name: `Bundle - ${bundleItems.length} services`,
          total_original_price: totalOriginal,
          total_discounted_price: totalDiscounted,
          discount_percentage: DISCOUNT_PERCENTAGE,
          status: "pending",
          scheduled_date: format(date, "yyyy-MM-dd"),
          scheduled_time: selectedTime,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone,
          customer_email: formData.customerEmail,
          notes: formData.notes,
        })
        .select()
        .single();

      if (bundleError) throw bundleError;

      // Add bundle items
      const bundleItemsToInsert = bundleItems.map((item) => ({
        bundle_id: bundle.id,
        service_id: item.id.includes("-") ? item.id : null, // Only use if it's a valid UUID
        service_name: item.name,
        service_category: item.category,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("bundle_items")
        .insert(bundleItemsToInsert);

      if (itemsError) throw itemsError;

      // Clear bundle from localStorage
      localStorage.removeItem("serviceBundle");
      window.dispatchEvent(new Event("bundleUpdated"));

      setSuccess(true);
      toast({
        title: "Bundle booked successfully!",
        description: `You saved ₹${discount.toFixed(0)} with bundle discount.`,
      });
    } catch (error: any) {
      console.error("Bundle booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to book bundle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-12">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Bundle Booked!</h1>
              <p className="text-muted-foreground mb-6">
                Your {bundleItems.length}-service bundle has been booked successfully. 
                You saved ₹{discount.toFixed(0)}!
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/my-bookings")}>
                  View Bookings
                </Button>
                <Button onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Bundle Checkout</h1>
              <p className="text-muted-foreground">
                Book {bundleItems.length} services in one visit and save {DISCOUNT_PERCENTAGE}%
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Services Summary */}
            <Card className="md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Your Bundle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bundleItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <span>₹{item.price}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{totalOriginal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Bundle Discount
                    </span>
                    <span>-₹{discount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{totalDiscounted.toFixed(0)}</span>
                  </div>
                </div>

                <Badge variant="secondary" className="w-full justify-center mt-2">
                  You save ₹{discount.toFixed(0)}!
                </Badge>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        required
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({ ...formData, customerName: e.target.value })
                        }
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone Number *</Label>
                      <Input
                        id="customerPhone"
                        required
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, customerPhone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, customerEmail: e.target.value })
                      }
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Your full address"
                      rows={2}
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        required
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Preferred Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Time Slot *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedTime && "text-muted-foreground"
                            )}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {selectedTime || "Select time"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <div className="grid grid-cols-2 gap-2">
                            {timeSlots.map((slot) => (
                              <Button
                                key={slot}
                                variant={selectedTime === slot ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                                onClick={() => setSelectedTime(slot)}
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any special instructions or details..."
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Booking..." : `Book Bundle for ₹${totalDiscounted.toFixed(0)}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BundleCheckout;
