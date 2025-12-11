-- Create role enum
CREATE TYPE public.app_role AS ENUM ('customer', 'technician', 'admin');

-- Create KYC status enum
CREATE TYPE public.kyc_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create technician profiles table
CREATE TABLE public.technician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  id_document_url TEXT,
  id_document_type TEXT,
  certifications TEXT[],
  skills TEXT[],
  years_of_experience INTEGER DEFAULT 0,
  background_check_consent BOOLEAN DEFAULT false,
  bank_account_number TEXT,
  bank_ifsc_code TEXT,
  bank_account_holder_name TEXT,
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  kyc_rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for technician_profiles
CREATE POLICY "Technicians can view their own profile"
ON public.technician_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Technicians can insert their own profile"
ON public.technician_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Technicians can update their own profile"
ON public.technician_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all technician profiles"
ON public.technician_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all technician profiles"
ON public.technician_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_technician_profiles_updated_at
BEFORE UPDATE ON public.technician_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

-- Storage policies for KYC documents
CREATE POLICY "Technicians can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Technicians can view their own documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'kyc-documents' AND public.has_role(auth.uid(), 'admin'));