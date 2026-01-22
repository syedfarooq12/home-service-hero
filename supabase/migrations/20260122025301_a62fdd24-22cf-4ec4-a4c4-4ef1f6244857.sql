-- Add selfie and face verification columns to technician_profiles
ALTER TABLE public.technician_profiles
ADD COLUMN IF NOT EXISTS selfie_url text,
ADD COLUMN IF NOT EXISTS face_match_score numeric,
ADD COLUMN IF NOT EXISTS face_match_verified boolean DEFAULT false;