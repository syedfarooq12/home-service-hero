import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
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
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

// Mock service data
const serviceData: Record<string, {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  duration: string;
  image: string;
  description: string;
  includes: string[];
  addons: { id: string; name: string; price: number }[];
}> = {
  "ac-service": {
    id: "ac-service",
    name: "AC Service & Repair",
    category: "AC Service",
    price: 499,
    originalPrice: 799,
    rating: 4.8,
    reviews: 2340,
    duration: "60-90 min",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format&fit=crop",
    description: "Complete AC service including deep cleaning, gas pressure check, and performance optimization. Our technicians are trained to handle all AC brands and models.",
    includes: [
      "Filter cleaning",
      "Coil cleaning (indoor & outdoor)",
      "Gas pressure check",
      "Drainage cleaning",
      "Performance test",
      "30-day service warranty"
    ],
    addons: [
      { id: "gas-refill", name: "Gas Refill (if needed)", price: 1500 },
      { id: "deep-clean", name: "Deep Chemical Wash", price: 799 },
      { id: "stabilizer", name: "Stabilizer Installation", price: 399 },
    ]
  },
  "deep-cleaning": {
    id: "deep-cleaning",
    name: "Full Home Deep Cleaning",
    category: "Cleaning",
    price: 1999,
    originalPrice: 2999,
    rating: 4.9,
    reviews: 1856,
    duration: "4-6 hours",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    description: "Comprehensive deep cleaning service for your entire home. We clean every corner, from kitchen to bathrooms, living spaces to bedrooms.",
    includes: [
      "Kitchen deep cleaning",
      "Bathroom sanitization",
      "Floor mopping & scrubbing",
      "Dusting all surfaces",
      "Window cleaning (inside)",
      "Furniture cleaning"
    ],
    addons: [
      { id: "balcony", name: "Balcony Cleaning", price: 299 },
      { id: "sofa", name: "Sofa Deep Cleaning", price: 499 },
      { id: "carpet", name: "Carpet Cleaning", price: 699 },
    ]
  }
};

// Default service for unknown IDs
const defaultService = {
  id: "default",
  name: "Service",
  category: "General",
  price: 299,
  originalPrice: 499,
  rating: 4.5,
  reviews: 100,
  duration: "30-60 min",
  image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
  description: "Professional home service by verified technicians.",
  includes: ["Service visit", "Issue diagnosis", "Basic repair", "30-day warranty"],
  addons: []
};

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const service = serviceData[id || ""] || defaultService;
  
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    const basePrice = service.price * quantity;
    const addonsPrice = service.addons
      .filter(addon => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
    return basePrice + addonsPrice;
  };

  const handleBookNow = () => {
    toast.success("Redirecting to booking...", {
      description: "Choose your preferred date and time."
    });
  };

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
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Service Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-primary">{service.category}</span>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{service.rating}</span>
                    <span className="text-sm text-muted-foreground">({service.reviews.toLocaleString()} reviews)</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{service.name}</h1>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>

              {/* What's Included */}
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

              {/* Why Choose Us */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Verified Pros</h3>
                  <p className="text-sm text-muted-foreground">Background-checked technicians</p>
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
                  <span className="text-lg text-muted-foreground line-through">₹{service.originalPrice}</span>
                  <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-sm font-semibold">
                    {Math.round((1 - service.price / service.originalPrice) * 100)}% OFF
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <Clock className="h-5 w-5" />
                  <span>Estimated duration: {service.duration}</span>
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

                {/* Add-ons */}
                {service.addons.length > 0 && (
                  <div className="mb-6">
                    <label className="text-sm font-medium text-foreground mb-3 block">Add-ons (Optional)</label>
                    <div className="space-y-2">
                      {service.addons.map((addon) => (
                        <label
                          key={addon.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedAddons.includes(addon.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedAddons.includes(addon.id)}
                              onChange={() => toggleAddon(addon.id)}
                              className="sr-only"
                            />
                            <div className={`h-5 w-5 rounded border flex items-center justify-center ${
                              selectedAddons.includes(addon.id)
                                ? "bg-primary border-primary"
                                : "border-border"
                            }`}>
                              {selectedAddons.includes(addon.id) && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                              )}
                            </div>
                            <span className="text-sm text-foreground">{addon.name}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">+₹{addon.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

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
