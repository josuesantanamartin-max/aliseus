-- Create the new table for Family Agenda events
CREATE TABLE IF NOT EXISTS public.life_family_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    household_id uuid NOT NULL,
    title text NOT NULL,
    time_str text NOT NULL,
    location text,
    event_type text NOT NULL CHECK (event_type IN ('MEDICAL', 'EDUCATION', 'SOCIAL', 'SPORT', 'OTHER')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.life_family_events ENABLE ROW LEVEL SECURITY;

-- Create policies for life_family_events
CREATE POLICY "Users can view their own household events"
    ON public.life_family_events FOR SELECT
    USING (auth.uid() = user_id OR household_id IN (
        SELECT active_household_id FROM public.user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert events to their household"
    ON public.life_family_events FOR INSERT
    WITH CHECK (auth.uid() = user_id OR household_id IN (
        SELECT active_household_id FROM public.user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their household events"
    ON public.life_family_events FOR UPDATE
    USING (auth.uid() = user_id OR household_id IN (
        SELECT active_household_id FROM public.user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete their household events"
    ON public.life_family_events FOR DELETE
    USING (auth.uid() = user_id OR household_id IN (
        SELECT active_household_id FROM public.user_profiles WHERE id = auth.uid()
    ));

-- Enable Supabase Realtime for both tables
-- First, ensure the realtime publication exists
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;

-- Specifically add our tables if they aren't already included
ALTER PUBLICATION supabase_realtime ADD TABLE public.life_shopping_list;
ALTER PUBLICATION supabase_realtime ADD TABLE public.life_family_events;
