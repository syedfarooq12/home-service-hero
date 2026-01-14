-- Create a table for user's favorite technicians
CREATE TABLE public.favorite_technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  technician_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, technician_id)
);

-- Enable Row Level Security
ALTER TABLE public.favorite_technicians ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorite_technicians
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their favorites
CREATE POLICY "Users can add to favorites"
ON public.favorite_technicians
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove from their favorites
CREATE POLICY "Users can delete their favorites"
ON public.favorite_technicians
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_favorite_technicians_user_id ON public.favorite_technicians(user_id);
CREATE INDEX idx_favorite_technicians_technician_id ON public.favorite_technicians(technician_id);