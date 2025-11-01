-- Fix timetable_codes RLS policy to restrict reads to owner only
DROP POLICY IF EXISTS "Authenticated users can read timetable codes" ON timetable_codes;

CREATE POLICY "Users can read their own timetable codes"
ON timetable_codes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create tables for migrating localStorage data to database
CREATE TABLE IF NOT EXISTS public.user_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  total_classes integer DEFAULT 0,
  attended_classes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, code)
);

CREATE TABLE IF NOT EXISTS public.user_timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day text NOT NULL,
  subject_id uuid REFERENCES public.user_subjects(id) ON DELETE CASCADE NOT NULL,
  time text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, day, subject_id, time)
);

CREATE TABLE IF NOT EXISTS public.user_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  subject_id uuid REFERENCES public.user_subjects(id) ON DELETE CASCADE NOT NULL,
  timetable_entry_id uuid REFERENCES public.user_timetable(id) ON DELETE CASCADE,
  present boolean NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date, timetable_entry_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attendance ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_subjects
CREATE POLICY "Users manage own subjects"
ON public.user_subjects FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_timetable
CREATE POLICY "Users manage own timetable"
ON public.user_timetable FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_attendance
CREATE POLICY "Users manage own attendance"
ON public.user_attendance FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_user_subjects_updated_at
BEFORE UPDATE ON public.user_subjects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_attendance_updated_at
BEFORE UPDATE ON public.user_attendance
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();