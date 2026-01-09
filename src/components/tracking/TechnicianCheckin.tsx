import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TechnicianCheckinProps {
  bookingId: string;
  onCheckin?: () => void;
}

const statusOptions = [
  { value: 'en_route', label: 'On the way', icon: Navigation },
  { value: 'arrived', label: 'Arrived at location', icon: MapPin },
  { value: 'working', label: 'Working on service', icon: Clock },
  { value: 'completed', label: 'Service completed', icon: CheckCircle },
];

export const TechnicianCheckin = ({ bookingId, onCheckin }: TechnicianCheckinProps) => {
  const [status, setStatus] = useState<string>('en_route');
  const [etaMinutes, setEtaMinutes] = useState<string>('15');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGettingLocation(false);
        toast.success('Location captured successfully');
      },
      (error) => {
        setGettingLocation(false);
        toast.error('Unable to get your location. Please enable location services.');
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckin = async () => {
    if (!coords) {
      toast.error('Please capture your location first');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Check if there's an existing location record
      const { data: existing } = await supabase
        .from('technician_locations')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('technician_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('technician_locations')
          .update({
            latitude: coords.lat,
            longitude: coords.lng,
            status,
            eta_minutes: status === 'en_route' ? parseInt(etaMinutes) : null,
            last_checkin_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('technician_locations')
          .insert({
            booking_id: bookingId,
            technician_id: user.id,
            latitude: coords.lat,
            longitude: coords.lng,
            status,
            eta_minutes: status === 'en_route' ? parseInt(etaMinutes) : null,
          });

        if (error) throw error;
      }

      toast.success('Check-in successful! Customer has been updated.');
      onCheckin?.();
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStatus = statusOptions.find(s => s.value === status);
  const StatusIcon = selectedStatus?.icon || Navigation;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Update Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location capture */}
        <div className="space-y-2">
          <Label>Your Location</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="flex-1"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {gettingLocation ? 'Getting location...' : coords ? 'Update Location' : 'Capture Location'}
            </Button>
          </div>
          {coords && (
            <p className="text-sm text-muted-foreground">
              📍 Location captured: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Status select */}
        <div className="space-y-2">
          <Label>Current Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue>
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  {selectedStatus?.label}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* ETA input (only for en_route) */}
        {status === 'en_route' && (
          <div className="space-y-2">
            <Label>Estimated Time of Arrival (minutes)</Label>
            <Input
              type="number"
              value={etaMinutes}
              onChange={(e) => setEtaMinutes(e.target.value)}
              min="1"
              max="120"
              placeholder="15"
            />
          </div>
        )}

        <Button
          onClick={handleCheckin}
          disabled={loading || !coords}
          className="w-full"
        >
          {loading ? 'Updating...' : 'Check In & Update Customer'}
        </Button>
      </CardContent>
    </Card>
  );
};
