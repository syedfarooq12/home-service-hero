-- Create bookings table with live tracking support
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  technician_id UUID REFERENCES public.technician_profiles(id),
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'technician_assigned', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled')),
  amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  technician_location_lat DECIMAL(10,8),
  technician_location_lng DECIMAL(11,8),
  estimated_arrival_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (for cancellation)
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id);

-- Technicians can view assigned bookings
CREATE POLICY "Technicians can view assigned bookings"
ON public.bookings
FOR SELECT
USING (
  technician_id IN (
    SELECT id FROM public.technician_profiles WHERE user_id = auth.uid()
  )
);

-- Technicians can update assigned bookings
CREATE POLICY "Technicians can update assigned bookings"
ON public.bookings
FOR UPDATE
USING (
  technician_id IN (
    SELECT id FROM public.technician_profiles WHERE user_id = auth.uid()
  )
);

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
ON public.bookings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_technician_id ON public.bookings(technician_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_city ON public.bookings(city);
CREATE INDEX idx_bookings_scheduled_date ON public.bookings(scheduled_date);

-- Enable realtime for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;