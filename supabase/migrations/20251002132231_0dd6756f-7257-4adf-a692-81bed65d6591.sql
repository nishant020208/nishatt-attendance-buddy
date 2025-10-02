-- Create timetable codes table for sharing timetables
CREATE TABLE IF NOT EXISTS public.timetable_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  timetable_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_timetable_codes_code ON public.timetable_codes(code);

-- Enable RLS
ALTER TABLE public.timetable_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read timetable codes (for importing)
CREATE POLICY "Anyone can read timetable codes"
ON public.timetable_codes
FOR SELECT
USING (true);

-- Allow anyone to create timetable codes
CREATE POLICY "Anyone can create timetable codes"
ON public.timetable_codes
FOR INSERT
WITH CHECK (true);