-- Create services table for admin-managed services
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric NOT NULL,
  original_price numeric,
  duration text,
  image_url text,
  rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  includes text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  is_hidden boolean NOT NULL DEFAULT false,
  available_locations text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public can view active, non-hidden services
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (is_active = true AND is_hidden = false);

-- Admins can do everything
CREATE POLICY "Admins can manage all services"
ON public.services
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster filtering
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_is_active ON public.services(is_active);
CREATE INDEX idx_services_available_locations ON public.services USING GIN(available_locations);