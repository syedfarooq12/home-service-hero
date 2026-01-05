import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
}

interface AdsBannerProps {
  position?: string;
}

export const AdsBanner = ({ position = "homepage" }: AdsBannerProps) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchAds();
  }, [position]);

  useEffect(() => {
    if (ads.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("ads")
      .select("id, title, description, image_url, link_url")
      .eq("position", position)
      .eq("is_active", true);

    if (!error && data) {
      setAds(data);
    }
  };

  if (dismissed || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  const handleClick = () => {
    if (currentAd.link_url) {
      window.open(currentAd.link_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        aria-label="Dismiss ad"
      >
        <X className="w-4 h-4 text-white" />
      </button>
      
      <div
        onClick={handleClick}
        className={`relative ${currentAd.link_url ? "cursor-pointer" : ""}`}
      >
        <img
          src={currentAd.image_url}
          alt={currentAd.title}
          className="w-full h-40 md:h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-bold text-lg">{currentAd.title}</h3>
          {currentAd.description && (
            <p className="text-sm text-white/80 line-clamp-2">{currentAd.description}</p>
          )}
        </div>
      </div>

      {/* Indicators */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 right-4 flex gap-1.5">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
