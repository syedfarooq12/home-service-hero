import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { TrustBanner } from "@/components/common/VerifiedBadge";
import { 
  Star, 
  Clock, 
  Shield, 
  CheckCircle2, 
  Plus, 
  Minus,
  MapPin,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

// Default service for unknown IDs or fallback
const defaultService = {
  id: "default",
  name: "Service",
  category: "General",
  price: 299,
  original_price: 499,
  rating: 4.5,
  reviews_count: 100,
  duration: "30-60 min",
  image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
  description: "Professional home service by verified technicians.",
  includes: ["Service visit", "Issue diagnosis", "Basic repair", "30-day warranty"],
  available_locations: [],
  is_active: true,
  is_hidden: false,
  created_at: "",
  updated_at: "",
};

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | typeof defaultService>(defaultService);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchService(id);
    }
  }, [id]);

  const fetchService = async (serviceId: string) => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();

    if (error || !data) {
      // Fallback to default service
      setService({ ...defaultService, name: "Service Not Found" });
    } else {
      setService(data);
    }
    setLoading(false);
  };

  const calculateTotal = () => {
    return Number(service.price) * quantity;
  };

  const handleBookNow = () => {
    toast.success("Redirecting to booking...", {
      description: "Choose your preferred date and time."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="py-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/services" className="hover:text-foreground transition-colors">Services</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{service.name}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Service Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Back Button - Mobile */}
              <Link to="/services" className="lg:hidden inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Services
              </Link>

              {/* Hero Image */}
              <div className="aspect-video rounded-2xl overflow-hidden">
                <img
                  src={service.image_url || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop"}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Service Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-primary capitalize">{service.category}</span>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{service.rating || 4.5}</span>
                    <span className="text-sm text-muted-foreground">({(service.reviews_count || 100).toLocaleString()} reviews)</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{service.name}</h1>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>

              {/* What's Included */}
              {service.includes && service.includes.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-semibold text-foreground mb-4">What's Included</h2>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {service.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trust Banner */}
              <TrustBanner />

              {/* Why Choose Us */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Verified Pros</h3>
                  <p className="text-sm text-muted-foreground">ID verified & background-checked</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">On-Time Arrival</h3>
                  <p className="text-sm text-muted-foreground">45 min average response</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Satisfaction Guaranteed</h3>
                  <p className="text-sm text-muted-foreground">30-day service warranty</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl p-6 border border-border shadow-lg">
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-foreground">₹{service.price}</span>
                  {service.original_price && Number(service.original_price) > Number(service.price) && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">₹{service.original_price}</span>
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-sm font-semibold">
                        {Math.round((1 - Number(service.price) / Number(service.original_price)) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <Clock className="h-5 w-5" />
                  <span>Estimated duration: {service.duration || "30-60 min"}</span>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-4 border-t border-border mb-6">
                  <span className="text-lg font-medium text-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground">₹{calculateTotal()}</span>
                </div>

                {/* Book Now Button */}
                <Button onClick={handleBookNow} variant="hero" size="xl" className="w-full mb-4">
                  <Calendar className="h-5 w-5" />
                  Book Now
                </Button>

                {/* Location Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <MapPin className="h-4 w-4" />
                  <span>Service available in your area</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;