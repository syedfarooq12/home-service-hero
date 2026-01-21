import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { TrustBanner } from "@/components/common/VerifiedBadge";
import { RazorpayButton, PricingBreakdown } from "@/components/payment/RazorpayButton";
import { BookingForm } from "@/components/booking/BookingForm";
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
  ShieldCheck,
  CreditCard,
  Lock,
  X,
  Package
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

// Fallback static services (matching Services.tsx)
const fallbackServices = [
  {
    id: "ac-service",
    name: "AC Service & Repair",
    category: "ac",
    price: 499,
    original_price: 799,
    rating: 4.8,
    reviews_count: 2340,
    duration: "60-90 min",
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format&fit=crop",
    description: "Complete AC service including cleaning, gas refill check, and performance optimization. Our certified technicians ensure your AC runs efficiently all year round.",
    is_active: true,
    is_hidden: false,
    includes: ["Deep cleaning of filters", "Gas pressure check", "Cooling efficiency test", "Compressor inspection", "30-day service warranty"],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "deep-cleaning",
    name: "Full Home Deep Cleaning",
    category: "cleaning",
    price: 1999,
    original_price: 2999,
    rating: 4.9,
    reviews_count: 1856,
    duration: "4-6 hours",
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    description: "Thorough cleaning of every corner including kitchen, bathrooms, and living spaces with eco-friendly products.",
    is_active: true,
    is_hidden: false,
    includes: ["Kitchen deep clean", "Bathroom sanitization", "Floor mopping & scrubbing", "Dusting all surfaces", "Window cleaning"],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "electrical-repair",
    name: "Electrical Repair Visit",
    category: "electrical",
    price: 299,
    original_price: 449,
    rating: 4.7,
    reviews_count: 3120,
    duration: "30-60 min",
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    description: "Fix electrical issues including switches, sockets, and wiring problems by certified electricians.",
    is_active: true,
    is_hidden: false,
    includes: ["Issue diagnosis", "Switch/socket repair", "Wiring inspection", "Safety check", "30-day warranty"],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "plumbing-repair",
    name: "Plumbing Repair Visit",
    category: "plumbing",
    price: 349,
    original_price: 499,
    rating: 4.6,
    reviews_count: 1920,
    duration: "30-60 min",
    image_url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=800&auto=format&fit=crop",
    description: "Fix leaks, blockages, and other plumbing issues with professional tools and expertise.",
    is_active: true,
    is_hidden: false,
    includes: ["Leak detection", "Pipe repair", "Drain cleaning", "Fixture repair", "30-day warranty"],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "carpentry-work",
    name: "Carpentry Work",
    category: "carpentry",
    price: 449,
    original_price: 599,
    rating: 4.7,
    reviews_count: 540,
    duration: "1-2 hours",
    image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop",
    description: "Furniture repair, door fixing, and general woodwork by skilled carpenters.",
    is_active: true,
    is_hidden: false,
    includes: ["Furniture repair", "Door/window fixing", "Cabinet work", "Wood polishing", "Material estimation"],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "washing-machine",
    name: "Washing Machine Repair",
    category: "appliance",
    price: 399,
    original_price: 599,
    rating: 4.6,
    reviews_count: 1100,
    duration: "45-90 min",
    image_url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=800&auto=format&fit=crop",
    description: "Diagnose and repair washing machine issues for all major brands.",
    is_active: true,
    is_hidden: false,
    includes: ["Issue diagnosis", "Motor check", "Drum inspection", "Parts replacement", "90-day warranty"],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "wall-painting",
    name: "Wall Painting",
    category: "painting",
    price: 18,
    original_price: 25,
    rating: 4.8,
    reviews_count: 670,
    duration: "Per sq.ft",
    image_url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop",
    description: "Professional wall painting with premium paints and expert finish.",
    is_active: true,
    is_hidden: false,
    includes: ["Surface preparation", "Primer application", "2-coat paint", "Clean finish", "Color consultation"],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "pest-control-home",
    name: "General Pest Control",
    category: "pest-control",
    price: 999,
    original_price: 1499,
    rating: 4.7,
    reviews_count: 890,
    duration: "1-2 hours",
    image_url: "https://images.unsplash.com/photo-1632935190508-f5b7c3f5c2e6?q=80&w=800&auto=format&fit=crop",
    description: "Complete pest control for cockroaches, ants, and common pests with safe chemicals.",
    is_active: true,
    is_hidden: false,
    includes: ["Full home treatment", "Kitchen focus", "Safe chemicals", "3-month protection", "Free follow-up"],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
];

// Default service for unknown IDs
const defaultService = {
  id: "default",
  name: "Service Not Found",
  category: "General",
  price: 299,
  original_price: 499,
  rating: 4.5,
  reviews_count: 100,
  duration: "30-60 min",
  image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
  description: "The requested service could not be found. Please browse our available services.",
  includes: [],
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
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchService(id);
    }
  }, [id]);

  const fetchService = async (serviceId: string) => {
    setLoading(true);

    // Allow multiple UI sections to link with "legacy" IDs while still resolving
    // to the same canonical fallback service.
    const serviceIdAliases: Record<string, string> = {
      plumbing: "plumbing-repair",
      carpenter: "carpentry-work",
      painting: "wall-painting",
      "pest-control": "pest-control-home",
      "appliance-repair": "washing-machine",
    };

    const canonicalId = serviceIdAliases[serviceId] ?? serviceId;

    // First check fallback services (for static IDs like "ac-service")
    const fallbackService = fallbackServices.find((s) => s.id === canonicalId);
    if (fallbackService) {
      setService(fallbackService);
      setLoading(false);
      return;
    }

    // Then try database query (for UUID-based IDs)
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", canonicalId)
      .maybeSingle();

    if (error || !data) {
      setService(defaultService);
    } else {
      setService(data);
    }
    setLoading(false);
  };

  const calculateTotal = () => {
    return Number(service.price) * quantity;
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
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

              {/* Hyper-Local Matching Banner */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-5 border border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Hyper-Local Matching</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll connect you with verified helpers within 5km of your location
                    </p>
                  </div>
                </div>
              </div>

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
                {/* Price Header */}
                <div className="flex items-baseline gap-3 mb-2">
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
                <p className="text-sm text-muted-foreground mb-4">per service</p>

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

                {/* Transparent Pricing Breakdown */}
                <PricingBreakdown
                  basePrice={Number(service.price)}
                  quantity={quantity}
                  originalPrice={service.original_price ? Number(service.original_price) : null}
                  showGst={false}
                />

                {/* Book Now Button */}
                <div className="mt-6 space-y-3">
                  <Button onClick={handleBookNow} variant="hero" size="xl" className="w-full">
                    <Calendar className="h-5 w-5" />
                    Book Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={() => {
                      const bundle = JSON.parse(localStorage.getItem("serviceBundle") || "[]");
                      const exists = bundle.some((item: any) => item.id === service.id);
                      if (exists) {
                        toast.info("Already in bundle", { description: "This service is already in your bundle." });
                        return;
                      }
                      bundle.push({
                        id: service.id,
                        name: service.name,
                        category: service.category,
                        price: Number(service.price),
                      });
                      localStorage.setItem("serviceBundle", JSON.stringify(bundle));
                      window.dispatchEvent(new Event("bundleUpdated"));
                      toast.success("Added to bundle!", { description: "Add more services to get 10% discount." });
                    }}
                  >
                    <Package className="h-5 w-5" />
                    Add to Bundle
                  </Button>
                </div>

                {/* Payment Security Badges */}
                <div className="bg-secondary/30 rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <img 
                      src="https://razorpay.com/favicon.png" 
                      alt="Razorpay" 
                      className="h-6 opacity-70"
                    />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>Cards, UPI, Wallets</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Pay securely via Razorpay. 100% safe & encrypted.
                  </p>
                </div>

                {/* Location Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center mt-4">
                  <MapPin className="h-4 w-4" />
                  <span>Service available in your area</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-xl">
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Book {service.name}</h2>
                  <p className="text-sm text-muted-foreground">Fill in your details to confirm booking</p>
                </div>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Service</p>
                      <p className="font-medium text-foreground">{service.name} × {quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-primary">₹{Number(service.price) * quantity}</p>
                    </div>
                  </div>
                </div>
                <BookingForm
                  serviceName={service.name}
                  serviceCategory={service.category}
                  amount={Number(service.price)}
                  quantity={quantity}
                  onSuccess={handleBookingSuccess}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;