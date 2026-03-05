import { useState, useEffect } from "react";
import { Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const defaultTips = [
  {
    title: "AC Maintenance",
    tip: "Schedule AC servicing before summer to avoid peak-season delays and ensure optimal cooling.",
    category: "ac-appliance"
  },
  {
    title: "Plumbing Checkup",
    tip: "Regular drain cleaning prevents costly blockages. Book a preventive checkup every 6 months.",
    category: "plumbing"
  },
  {
    title: "Deep Cleaning",
    tip: "Book deep cleaning before festivals or special occasions for a spotless home.",
    category: "cleaning"
  }
];

const AITipsSection = () => {
  const [tips, setTips] = useState(defaultTips);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAITips = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("ai-booking-assistant", {
          body: { 
            message: "Give me 3 short, practical tips for homeowners about booking home services. Format each as a JSON array with title, tip, and category (ac-appliance, cleaning, plumbing, electrical, painting, carpentry). Keep each tip under 20 words." 
          }
        });

        if (!error && data?.response) {
          try {
            const parsed = JSON.parse(data.response.replace(/```json\n?|\n?```/g, ''));
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTips(parsed.slice(0, 3));
            }
          } catch {
            // Keep default tips if parsing fails
          }
        }
      } catch (error) {
        console.error("Failed to fetch AI tips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAITips();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Tips</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Smart Booking Suggestions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get personalized recommendations to keep your home in perfect condition
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tips.map((tip, idx) => (
            <div 
              key={idx}
              className={`group relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col ${isLoading ? 'animate-pulse' : ''}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
              
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">{tip.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">{tip.tip}</p>

              <Link to={`/services/${tip.category}`}>
                <Button variant="ghost" size="sm" className="group-hover:text-primary transition-colors">
                  Book Now
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AITipsSection;
