-- Add location coordinates to technician profiles for hyper-local matching
ALTER TABLE public.technician_profiles 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS service_radius_km integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- Create index for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_technician_profiles_location 
ON public.technician_profiles (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create index for availability filtering
CREATE INDEX IF NOT EXISTS idx_technician_profiles_available 
ON public.technician_profiles (is_available, kyc_status) 
WHERE is_available = true AND kyc_status = 'approved';