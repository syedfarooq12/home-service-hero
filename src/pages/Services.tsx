import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Star, 
  Clock, 
  Filter,
  Zap, 
  Droplets, 
  Wind, 
  Sparkles, 
  Hammer, 
  Wrench,
  Paintbrush,
  Bug,
  Loader2
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

const categories = [
  { id: "all", name: "All Services", icon: null },
  { id: "electrical", name: "Electrical", icon: Zap },
  { id: "plumbing", name: "Plumbing", icon: Droplets },
  { id: "ac", name: "AC Service", icon: Wind },
  { id: "cleaning", name: "Cleaning", icon: Sparkles },
  { id: "carpentry", name: "Carpentry", icon: Hammer },
  { id: "appliance", name: "Appliance", icon: Wrench },
  { id: "painting", name: "Painting", icon: Paintbrush },
  { id: "pest-control", name: "Pest Control", icon: Bug },
];

// Fallback static services for when DB is empty
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
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=400&auto=format&fit=crop",
    description: "Complete AC service including cleaning, gas refill check, and performance optimization.",
    is_active: true,
    is_hidden: false,
    includes: [],
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
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
    description: "Thorough cleaning of every corner including kitchen, bathrooms, and living spaces.",
    is_active: true,
    is_hidden: false,
    includes: [],
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
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
    description: "Fix electrical issues including switches, sockets, and wiring problems.",
    is_active: true,
    is_hidden: false,
    includes: [],
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
    image_url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=400&auto=format&fit=crop",
    description: "Fix leaks, blockages, and other plumbing issues.",
    is_active: true,
    is_hidden: false,
    includes: [],
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
    image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop",
    description: "Furniture repair, door fixing, and general woodwork.",
    is_active: true,
    is_hidden: false,
    includes: [],
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
    image_url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=400&auto=format&fit=crop",
    description: "Diagnose and repair washing machine issues.",
    is_active: true,
    is_hidden: false,
    includes: [],
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
    image_url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop",
    description: "Professional wall painting with premium paints.",
    is_active: true,
    is_hidden: false,
    includes: [],
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
    image_url: "https://images.unsplash.com/photo-1632935190508-f5b7c3f5c2e6?q=80&w=400&auto=format&fit=crop",
    description: "Complete pest control for cockroaches, ants, and common pests.",
    is_active: true,
    is_hidden: false,
    includes: [],
    available_locations: [],
    created_at: "",
    updated_at: "",
  },
];

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [services, setServices] = useState<(Service | typeof fallbackServices[0])[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Use fallback services if DB is empty or error
      setServices(fallbackServices);
    } else {
      setServices(data);
    }
    setLoading(false);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || service.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              All Services
            </h1>
            <p className="text-muted-foreground">
              Browse our complete range of home services
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 rounded-xl"
              />
            </div>
            <Button variant="outline" className="h-12 gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category.icon && <category.icon className="h-4 w-4" />}
                {category.name}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Services Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service, index) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={service.image_url || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop"}
                      alt={service.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold">{service.rating || 4.5}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration || "30-60 min"}</span>
                      <span className="text-border">•</span>
                      <span>{(service.reviews_count || 100).toLocaleString()} reviews</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-foreground">₹{service.price}</span>
                        {service.original_price && Number(service.original_price) > Number(service.price) && (
                          <span className="text-sm text-muted-foreground line-through">₹{service.original_price}</span>
                        )}
                      </div>
                      {service.original_price && Number(service.original_price) > Number(service.price) && (
                        <div className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                          {Math.round((1 - Number(service.price) / Number(service.original_price)) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No services found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;