import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Clock, Shield, MessageCircle } from "lucide-react";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services?q=${searchQuery}&location=${location}`);
  };

  const stats = [
    { icon: Star, value: "4.8", label: "Average Rating" },
    { icon: Clock, value: "45 min", label: "Avg. Response" },
    { icon: Shield, value: "100%", label: "Verified Pros" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-card pt-8 pb-20 md:pt-16 md:pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Trusted by 50,000+ customers
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              Home services,{" "}
              <span className="text-gradient">made simple</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Book verified professionals for electrical, plumbing, cleaning, and more. 
              Same-day service with transparent pricing.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 pr-4 text-base rounded-xl border-border/50 bg-card shadow-md"
                />
              </div>
              <div className="relative sm:w-48">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-14 pl-12 pr-4 text-base rounded-xl border-border/50 bg-card shadow-md"
                />
              </div>
              <Button type="submit" variant="hero" size="xl">
                Search
              </Button>
            </form>

            {/* WhatsApp Contact Button */}
            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20a%20home%20service"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-slow group"
            >
              <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-sm opacity-90">Need instant help?</p>
                <p className="text-base">Chat on WhatsApp</p>
              </div>
            </a>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              {/* Main Image Container */}
              <div className="aspect-square rounded-3xl bg-gradient-hero p-1 shadow-2xl shadow-primary/20">
                <div className="h-full w-full rounded-[22px] bg-secondary flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop"
                    alt="Professional technician"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Floating Card 1 */}
              <div className="absolute -left-8 top-1/4 bg-card rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Quick Service</p>
                    <p className="text-sm text-muted-foreground">45 min arrival</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute -right-8 bottom-1/4 bg-card rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Top Rated</p>
                    <p className="text-sm text-muted-foreground">4.8/5 average</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
