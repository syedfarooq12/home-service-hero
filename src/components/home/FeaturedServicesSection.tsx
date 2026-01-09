import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Clock, ArrowRight, ShieldCheck } from "lucide-react";

const featuredServices = [
  {
    id: "ac-service",
    name: "AC Service & Repair",
    category: "AC Service",
    price: 499,
    originalPrice: 799,
    rating: 4.8,
    reviews: 2340,
    duration: "60-90 min",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=400&auto=format&fit=crop",
    badge: "Most Booked",
  },
  {
    id: "deep-cleaning",
    name: "Full Home Deep Cleaning",
    category: "Cleaning",
    price: 1999,
    originalPrice: 2999,
    rating: 4.9,
    reviews: 1856,
    duration: "4-6 hours",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
    badge: "Top Rated",
  },
  {
    id: "electrical-repair",
    name: "Electrical Repair Visit",
    category: "Electrical",
    price: 299,
    originalPrice: 449,
    rating: 4.7,
    reviews: 3120,
    duration: "30-60 min",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
    badge: null,
  },
  {
    id: "plumbing",
    name: "Plumbing Repair Visit",
    category: "Plumbing",
    price: 349,
    originalPrice: 499,
    rating: 4.6,
    reviews: 1920,
    duration: "30-60 min",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=400&auto=format&fit=crop",
    badge: null,
  },
  {
    id: "carpenter",
    name: "Furniture Assembly & Repair",
    category: "Carpentry",
    price: 399,
    originalPrice: 599,
    rating: 4.5,
    reviews: 1245,
    duration: "1-2 hours",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=400&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: "painting",
    name: "Home Painting Service",
    category: "Painting",
    price: 2499,
    originalPrice: 3999,
    rating: 4.8,
    reviews: 982,
    duration: "1-2 days",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop",
    badge: "Best Deal",
  },
  {
    id: "pest-control",
    name: "Pest Control Treatment",
    category: "Pest Control",
    price: 799,
    originalPrice: 1199,
    rating: 4.7,
    reviews: 1567,
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1632935191849-0d354d2720c2?q=80&w=400&auto=format&fit=crop",
    badge: null,
  },
  {
    id: "appliance-repair",
    name: "Appliance Repair Service",
    category: "Appliances",
    price: 449,
    originalPrice: 699,
    rating: 4.6,
    reviews: 2089,
    duration: "45-90 min",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop",
    badge: null,
  },
];

const FeaturedServicesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Services
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Most popular services with special discounts. Book now and save!
            </p>
          </div>
          <Link to="/services">
            <Button variant="outline" className="group">
              View All Services
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service, index) => (
            <Link
              key={service.id}
              to={`/service/${service.id}`}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {service.badge && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {service.badge}
                  </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <div className="px-2 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-sm flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-white" />
                    <span className="text-xs font-semibold text-white">Verified</span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-semibold">{service.rating}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-xs font-medium text-primary mb-1">{service.category}</p>
                <h3 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration}</span>
                  <span className="text-border">•</span>
                  <span>{service.reviews.toLocaleString()} reviews</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-foreground">₹{service.price}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{service.originalPrice}</span>
                  </div>
                  <div className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                    {Math.round((1 - service.price / service.originalPrice) * 100)}% OFF
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServicesSection;
