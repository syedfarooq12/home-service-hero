-- Create technician_locations table for real-time tracking
CREATE TABLE public.technician_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  status TEXT NOT NULL DEFAULT 'en_route' CHECK (status IN ('en_route', 'arrived', 'working', 'completed')),
  eta_minutes INTEGER,
  last_checkin_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.technician_locations ENABLE ROW LEVEL SECURITY;

-- Technicians can manage their own locations
CREATE POLICY "Technicians can manage their locations"
ON public.technician_locations
FOR ALL
USING (technician_id = auth.uid())
WITH CHECK (technician_id = auth.uid());

-- Customers can view location for their bookings
CREATE POLICY "Customers can view technician location for their bookings"
ON public.technician_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = technician_locations.booking_id
    AND bookings.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_technician_locations_updated_at
BEFORE UPDATE ON public.technician_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.technician_locations;

-- Add technician_id to bookings if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS technician_id UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_latitude DECIMAL(10, 8);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_longitude DECIMAL(11, 8);