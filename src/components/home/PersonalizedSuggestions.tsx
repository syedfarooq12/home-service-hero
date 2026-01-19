import { useState, useEffect } from "react";
import { Sparkles, History, Star, ArrowRight, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  title: string;
  description: string;
  reason: string;
  category: string;
  priority: "high" | "medium" | "low";
  timing?: string;
}

interface BookingHistory {
  service_category: string;
  service_name: string;
  scheduled_date: string;
  city: string;
}

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-primary/10 text-primary border-primary/20"
};

const PersonalizedSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchPersonalizedSuggestions(user.id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setIsLoading(false);
    }
  };

  const fetchPersonalizedSuggestions = async (uid: string) => {
    try {
      // Fetch user's booking history
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("service_category, service_name, scheduled_date, city")
        .eq("user_id", uid)
        .order("scheduled_date", { ascending: false })
        .limit(10);

      if (bookingsError) throw bookingsError;

      setBookingCount(bookings?.length || 0);

      if (!bookings || bookings.length === 0) {
        setIsLoading(false);
        return;
      }

      // Analyze booking patterns
      const bookingHistory: BookingHistory[] = bookings;
      const categories = bookingHistory.map(b => b.service_category);
      const uniqueCategories = [...new Set(categories)];
      const mostUsedCategory = categories.sort((a, b) =>
        categories.filter(v => v === a).length - categories.filter(v => v === b).length
      ).pop();

      // Calculate days since last booking for each category
      const categoryLastBooked: Record<string, number> = {};
      bookingHistory.forEach(b => {
        if (!categoryLastBooked[b.service_category]) {
          const daysSince = Math.floor(
            (Date.now() - new Date(b.scheduled_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          categoryLastBooked[b.service_category] = daysSince;
        }
      });

      // Generate AI-powered suggestions based on history
      const { data, error } = await supabase.functions.invoke("ai-booking-assistant", {
        body: {
          message: `Based on this customer's booking history, generate 3 personalized service suggestions:
          
Booking History:
${bookingHistory.map(b => `- ${b.service_name} (${b.service_category}) on ${b.scheduled_date}`).join('\n')}

Most used category: ${mostUsedCategory}
Categories used: ${uniqueCategories.join(', ')}
Days since last booking per category: ${JSON.stringify(categoryLastBooked)}

Generate suggestions as a JSON array with these fields:
- title: Service name (short)
- description: Why they should book (under 15 words)
- reason: Personalized reason based on their history (under 20 words)
- category: One of: ac-appliance, cleaning, plumbing, electrical, painting, carpentry
- priority: high/medium/low based on urgency
- timing: Best time to book (e.g., "This week", "Before monsoon")

Focus on:
1. Services they use regularly (maintenance reminders)
2. Complementary services to what they've used
3. Seasonal recommendations based on their location`
        }
      });

      if (!error && data?.response) {
        try {
          const parsed = JSON.parse(data.response.replace(/```json\n?|\n?```/g, ''));
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSuggestions(parsed.slice(0, 3));
          }
        } catch {
          // Generate fallback suggestions based on history
          generateFallbackSuggestions(bookingHistory, categoryLastBooked);
        }
      } else {
        generateFallbackSuggestions(bookingHistory, categoryLastBooked);
      }
    } catch (error) {
      console.error("Failed to fetch personalized suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackSuggestions = (
    history: BookingHistory[],
    lastBooked: Record<string, number>
  ) => {
    const fallback: Suggestion[] = [];
    
    // Suggest maintenance for services booked > 30 days ago
    Object.entries(lastBooked).forEach(([category, days]) => {
      if (days > 30 && fallback.length < 3) {
        fallback.push({
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} Maintenance`,
          description: `It's been ${days} days since your last booking`,
          reason: "Regular maintenance keeps your home running smoothly",
          category,
          priority: days > 90 ? "high" : days > 60 ? "medium" : "low",
          timing: days > 90 ? "This week" : "This month"
        });
      }
    });

    // Add complementary suggestions
    if (fallback.length < 3 && history.some(b => b.service_category === "ac-appliance")) {
      fallback.push({
        title: "Deep Cleaning",
        description: "Complement your AC service with a fresh clean",
        reason: "Your AC was recently serviced - perfect time for deep cleaning",
        category: "cleaning",
        priority: "medium",
        timing: "After AC service"
      });
    }

    setSuggestions(fallback.slice(0, 3));
  };

  // Don't render if user is not logged in
  if (!userId && !isLoading) {
    return null;
  }

  // Don't render if no booking history
  if (!isLoading && bookingCount === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-3">
              <User className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Personalized for You</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Smart Suggestions
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Based on your {bookingCount} past booking{bookingCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/my-bookings">
            <Button variant="outline" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              View History
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-5">
            {suggestions.map((suggestion, idx) => (
              <Card 
                key={idx}
                className="group relative overflow-hidden p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${priorityColors[suggestion.priority]}`}
                  >
                    {suggestion.priority === "high" ? "Recommended" : 
                     suggestion.priority === "medium" ? "Suggested" : "Consider"}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1.5">
                  {suggestion.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {suggestion.description}
                </p>
                
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 mb-4">
                  <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {suggestion.reason}
                  </p>
                </div>

                {suggestion.timing && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Best time: {suggestion.timing}</span>
                  </div>
                )}

                <Link to={`/services/${suggestion.category}`}>
                  <Button 
                    size="sm" 
                    className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                  >
                    Book Now
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default PersonalizedSuggestions;
