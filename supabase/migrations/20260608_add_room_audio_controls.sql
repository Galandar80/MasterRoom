-- Add master audio control columns to rooms table
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS audio_status text NOT NULL DEFAULT 'playing';
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS audio_volume integer NOT NULL DEFAULT 55;
