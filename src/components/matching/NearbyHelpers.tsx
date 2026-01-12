import { useState, useEffect } from "react";
import { MapPin, Star, Clock, Shield, Navigation, Users, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NearbyHelper {
  id: string;
  name: string;
  rating: number;
  jobsCompleted: number;
  distance: string;
  responseTime: string;
  skills: string[];
  isVerified: boolean;
  avatar?: string;
}

// Mock data - in production this would come from the database
const mockHelpers: NearbyHelper[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    rating: 4.9,
    jobsCompleted: 234,
    distance: "1.2 km",
    responseTime: "~15 min",
    skills: ["AC Repair", "Refrigerator", "Washing Machine"],
    isVerified: true,
  },
  {
    id: "2",
    name: "Suresh Sharma",
    rating: 4.8,
    jobsCompleted: 189,
    distance: "2.5 km",
    responseTime: "~25 min",
    skills: ["Electrician", "Wiring", "MCB Installation"],
    isVerified: true,
  },
  {
    id: "3",
    name: "Mohammed Ali",
    rating: 4.7,
    jobsCompleted: 156,
    distance: "3.1 km",
    responseTime: "~30 min",
    skills: ["Plumbing", "Pipe Fitting", "Water Heater"],
    isVerified: true,
  },
];

export const NearbyHelpers = ({ 
  serviceCategory,
  onSelectHelper 
}: { 
  serviceCategory?: string;
  onSelectHelper?: (helperId: string) => void;
}) => {
  const [helpers, setHelpers] = useState<NearbyHelper[]>(mockHelpers);
  const [userLocation, setUserLocation] = useState<string>("Detecting...");
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    // Simulate location detection
    const timer = setTimeout(() => {
      setUserLocation("Indiranagar, Bangalore");
      setIsLocating(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Helpers Near You
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className={isLocating ? "animate-pulse" : ""}>
              {userLocation}
            </span>
          </div>
        </div>
        <Badge variant="secondary" className="bg-accent/10 text-accent border-0">
          {helpers.length} Available
        </Badge>
      </div>

      {/* Helpers List */}
      <div className="space-y-4">
        {helpers.map((helper, index) => (
          <div
            key={helper.id}
            className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
              index === 0 
                ? "border-accent bg-accent/5" 
                : "border-border hover:border-primary/30"
            }`}
            onClick={() => onSelectHelper?.(helper.id)}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-lg">
                  {helper.name.charAt(0)}
                </div>
                {helper.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground truncate">
                    {helper.name}
                  </h4>
                  {index === 0 && (
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      Best Match
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-foreground">{helper.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{helper.jobsCompleted} jobs</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    <span>{helper.distance} away</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>ETA {helper.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {helper.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-emerald-500" />
          <span>All helpers are ID verified & background checked</span>
        </div>
      </div>
    </div>
  );
};

export const LocationBadge = ({ pincode, city }: { pincode?: string; city?: string }) => {
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [location, setLocation] = useState({ pincode, city });

  const detectLocation = () => {
    setDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // In production, reverse geocode to get pincode/city
          setLocation({ pincode: "560038", city: "Bangalore" });
          setDetectingLocation(false);
        },
        () => {
          setDetectingLocation(false);
        }
      );
    }
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
      <MapPin className="h-4 w-4" />
      {location.city ? (
        <span>{location.city} - {location.pincode}</span>
      ) : (
        <button
          onClick={detectLocation}
          disabled={detectingLocation}
          className="hover:underline"
        >
          {detectingLocation ? "Detecting..." : "Detect my location"}
        </button>
      )}
    </div>
  );
};

export const HyperLocalBanner = () => {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 border border-primary/20">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Navigation className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Hyper-Local Matching
          </h3>
          <p className="text-muted-foreground">
            We connect you with trusted, verified helpers within your neighborhood. 
            Faster response times, familiar faces, and community-trusted service.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-3xl font-bold text-primary">5km</div>
          <div className="text-sm text-muted-foreground">Avg. helper distance</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary/20">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">15min</div>
          <div className="text-xs text-muted-foreground">Avg. response</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">100%</div>
          <div className="text-xs text-muted-foreground">Verified helpers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">4.8★</div>
          <div className="text-xs text-muted-foreground">Avg. rating</div>
        </div>
      </div>
    </div>
  );
};
