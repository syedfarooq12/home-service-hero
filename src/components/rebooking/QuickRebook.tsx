import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, RefreshCw, Star, MapPin, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PastBooking {
  id: string;
  service_name: string;
  service_category: string;
  technician_id: string | null;
  scheduled_date: string;
  amount: number | null;
  technician?: {
    id: string;
    full_name: string;
    city: string;
    skills: string[] | null;
    years_of_experience: number | null;
  };
}

interface FavoriteHelper {
  technician_id: string;
  technician: {
    id: string;
    full_name: string;
    city: string;
    skills: string[] | null;
    years_of_experience: number | null;
    is_available: boolean | null;
  };
}

export const QuickRebookSection = () => {
  const [pastBookings, setPastBookings] = useState<PastBooking[]>([]);
  const [favorites, setFavorites] = useState<FavoriteHelper[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      await Promise.all([fetchPastBookings(user.id), fetchFavorites(user.id)]);
    }
    setLoading(false);
  };

  const fetchPastBookings = async (uid: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_name,
        service_category,
        technician_id,
        scheduled_date,
        amount
      `)
      .eq('user_id', uid)
      .eq('status', 'completed')
      .not('technician_id', 'is', null)
      .order('scheduled_date', { ascending: false })
      .limit(5);

    if (!error && data) {
      // Fetch technician details separately
      const technicianIds = [...new Set(data.map(b => b.technician_id).filter(Boolean))];
      if (technicianIds.length > 0) {
        const { data: technicians } = await supabase
          .from('technician_profiles')
          .select('id, full_name, city, skills, years_of_experience')
          .in('id', technicianIds);

        const bookingsWithTechnicians = data.map(booking => ({
          ...booking,
          technician: technicians?.find(t => t.id === booking.technician_id)
        }));
        setPastBookings(bookingsWithTechnicians);
      }
    }
  };

  const fetchFavorites = async (uid: string) => {
    const { data, error } = await supabase
      .from('favorite_technicians')
      .select('technician_id')
      .eq('user_id', uid);

    if (!error && data && data.length > 0) {
      const technicianIds = data.map(f => f.technician_id);
      const { data: technicians } = await supabase
        .from('technician_profiles')
        .select('id, full_name, city, skills, years_of_experience, is_available')
        .in('id', technicianIds);

      if (technicians) {
        const favoritesWithDetails = data.map(fav => ({
          ...fav,
          technician: technicians.find(t => t.id === fav.technician_id)!
        })).filter(f => f.technician);
        setFavorites(favoritesWithDetails);
      }
    }
  };

  const toggleFavorite = async (technicianId: string) => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please login to save favorite helpers",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.some(f => f.technician_id === technicianId);

    if (isFavorite) {
      const { error } = await supabase
        .from('favorite_technicians')
        .delete()
        .eq('user_id', userId)
        .eq('technician_id', technicianId);

      if (!error) {
        setFavorites(prev => prev.filter(f => f.technician_id !== technicianId));
        toast({ title: "Removed from favorites" });
      }
    } else {
      const { error } = await supabase
        .from('favorite_technicians')
        .insert({ user_id: userId, technician_id: technicianId });

      if (!error) {
        await fetchFavorites(userId);
        toast({ title: "Added to favorites!" });
      }
    }
  };

  const handleQuickRebook = (booking: PastBooking) => {
    // Navigate to service detail with pre-filled technician
    navigate(`/services/${booking.service_category}`, {
      state: { 
        preferredTechnician: booking.technician_id,
        rebookService: booking.service_name
      }
    });
    toast({
      title: "Quick Rebook",
      description: `Rebooking ${booking.service_name} with ${booking.technician?.full_name}`
    });
  };

  const handleBookFavorite = (favorite: FavoriteHelper) => {
    navigate('/services', {
      state: { preferredTechnician: favorite.technician_id }
    });
  };

  if (loading) return null;
  if (!userId || (pastBookings.length === 0 && favorites.length === 0)) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">One-Tap Rebooking</h2>
          </div>
          <p className="text-muted-foreground">Quickly rebook your favorite helpers</p>
        </div>

        {/* Favorite Helpers */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              Your Favorite Helpers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => (
                <Card key={favorite.technician_id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{favorite.technician.full_name}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {favorite.technician.city}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(favorite.technician_id)}
                        className="text-red-500"
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </Button>
                    </div>
                    
                    {favorite.technician.skills && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {favorite.technician.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={favorite.technician.is_available ? "default" : "secondary"}>
                        {favorite.technician.is_available ? "Available" : "Busy"}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleBookFavorite(favorite)}
                        disabled={!favorite.technician.is_available}
                        className="gap-1"
                      >
                        <Zap className="h-4 w-4" />
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings for Quick Rebook */}
        {pastBookings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Rebook Recent Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{booking.service_name}</h4>
                        <p className="text-sm text-muted-foreground">{booking.service_category}</p>
                      </div>
                      {booking.technician && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(booking.technician_id!)}
                          className={favorites.some(f => f.technician_id === booking.technician_id) 
                            ? "text-red-500" 
                            : "text-muted-foreground hover:text-red-500"
                          }
                        >
                          <Heart className={`h-4 w-4 ${favorites.some(f => f.technician_id === booking.technician_id) ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                    </div>

                    {booking.technician && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {booking.technician.full_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{booking.technician.full_name}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                            {booking.technician.years_of_experience || 0}+ years exp
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(booking.scheduled_date).toLocaleDateString()}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleQuickRebook(booking)}
                        className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Rebook
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuickRebookSection;
