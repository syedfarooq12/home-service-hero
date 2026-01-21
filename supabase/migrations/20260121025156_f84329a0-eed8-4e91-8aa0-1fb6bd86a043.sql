-- Create service bundles table for multi-stop bookings
CREATE TABLE public.service_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bundle_name TEXT,
  total_original_price NUMERIC DEFAULT 0,
  total_discounted_price NUMERIC DEFAULT 0,
  discount_percentage NUMERIC DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_date DATE,
  scheduled_time TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  technician_id UUID REFERENCES public.technician_profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bundle items table to store services in each bundle
CREATE TABLE public.bundle_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.service_bundles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_bundles
CREATE POLICY "Users can view their own bundles"
ON public.service_bundles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bundles"
ON public.service_bundles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bundles"
ON public.service_bundles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bundles"
ON public.service_bundles
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bundles"
ON public.service_bundles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Technicians can view assigned bundles"
ON public.service_bundles
FOR SELECT
USING (technician_id IN (
  SELECT id FROM technician_profiles WHERE user_id = auth.uid()
));

-- RLS policies for bundle_items
CREATE POLICY "Users can view items in their bundles"
ON public.bundle_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM service_bundles 
  WHERE service_bundles.id = bundle_items.bundle_id 
  AND service_bundles.user_id = auth.uid()
));

CREATE POLICY "Users can add items to their bundles"
ON public.bundle_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM service_bundles 
  WHERE service_bundles.id = bundle_items.bundle_id 
  AND service_bundles.user_id = auth.uid()
));

CREATE POLICY "Users can delete items from their bundles"
ON public.bundle_items
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM service_bundles 
  WHERE service_bundles.id = bundle_items.bundle_id 
  AND service_bundles.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all bundle items"
ON public.bundle_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM service_bundles sb
  WHERE sb.id = bundle_items.bundle_id
  AND has_role(auth.uid(), 'admin'::app_role)
));

-- Trigger for updated_at
CREATE TRIGGER update_service_bundles_updated_at
BEFORE UPDATE ON public.service_bundles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();