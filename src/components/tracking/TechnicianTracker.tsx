import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Clock, User, Phone, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TechnicianLocation {
  id: string;
  technician_id: string;
  booking_id: string;
  latitude: number;
  longitude: number;
  status: 'en_route' | 'arrived' | 'working' | 'completed';
  eta_minutes: number | null;
  last_checkin_at: string;
}

interface TechnicianTrackerProps {
  bookingId: string;
  technicianName?: string;
  technicianPhone?: string;
}

const statusConfig = {
  en_route: { label: 'On the way', color: 'bg-blue-500', progress: 25, icon: Navigation },
  arrived: { label: 'Arrived', color: 'bg-green-500', progress: 50, icon: MapPin },
  working: { label: 'Working', color: 'bg-orange-500', progress: 75, icon: User },
  completed: { label: 'Completed', color: 'bg-emerald-500', progress: 100, icon: Clock },
};

export const TechnicianTracker = ({ bookingId, technicianName, technicianPhone }: TechnicianTrackerProps) => {
  const [location, setLocation] = useState<TechnicianLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      const { data, error } = await supabase
        .from('technician_locations')
        .select('*')
        .eq('booking_id', bookingId)
        .order('last_checkin_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLocation(data as TechnicianLocation);
      }
      setLoading(false);
    };

    fetchLocation();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`location-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'technician_locations',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          if (payload.new) {
            setLocation(payload.new as TechnicianLocation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!location) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Technician tracking not yet available</p>
          <p className="text-sm">Tracking will start once the technician begins the journey</p>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[location.status];
  const StatusIcon = status.icon;
  const lastUpdate = new Date(location.last_checkin_at);
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / 60000);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Live Tracking
          </CardTitle>
          <Badge className={`${status.color} text-white`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Dispatched</span>
            <span>Arrived</span>
            <span>Working</span>
            <span>Done</span>
          </div>
        </div>

        {/* ETA */}
        {location.status === 'en_route' && location.eta_minutes && (
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-lg">{location.eta_minutes} min</p>
              <p className="text-sm text-muted-foreground">Estimated arrival time</p>
            </div>
          </div>
        )}

        {/* Technician info */}
        {(technicianName || technicianPhone) && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{technicianName || 'Technician'}</p>
                <p className="text-sm text-muted-foreground">Your service professional</p>
              </div>
            </div>
            {technicianPhone && (
              <a
                href={`tel:${technicianPhone}`}
                className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* Last update */}
        <p className="text-xs text-muted-foreground text-center">
          Last updated {timeSinceUpdate === 0 ? 'just now' : `${timeSinceUpdate} min ago`}
        </p>
      </CardContent>
    </Card>
  );
};
