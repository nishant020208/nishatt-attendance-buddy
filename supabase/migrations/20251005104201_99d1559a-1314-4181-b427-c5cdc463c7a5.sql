-- Add user_id column to track ownership
ALTER TABLE public.timetable_codes 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_timetable_codes_user_id ON public.timetable_codes(user_id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can create timetable codes" ON public.timetable_codes;
DROP POLICY IF EXISTS "Anyone can read timetable codes" ON public.timetable_codes;

-- New secure policies
-- Only authenticated users can create codes, and they must own them
CREATE POLICY "Authenticated users can create their own timetable codes"
ON public.timetable_codes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can read any code (needed for the import/share feature)
-- This is secure because: 1) Requires authentication 2) Codes are random/hard to guess 3) It's the intended sharing mechanism
CREATE POLICY "Authenticated users can read timetable codes"
ON public.timetable_codes
FOR SELECT
TO authenticated
USING (true);

-- Users can delete their own codes
CREATE POLICY "Users can delete their own timetable codes"
ON public.timetable_codes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();