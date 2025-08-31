-- Create speakers/preachers table
CREATE TABLE public.speakers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;

-- Create policies for speakers
CREATE POLICY "Anyone can view speakers" ON public.speakers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert speakers" ON public.speakers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update speakers" ON public.speakers
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete speakers" ON public.speakers
  FOR DELETE TO authenticated
  USING (true);

-- Add speaker_id to videos table
ALTER TABLE public.videos ADD COLUMN speaker_id UUID REFERENCES public.speakers(id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on speakers
CREATE TRIGGER update_speakers_updated_at
  BEFORE UPDATE ON public.speakers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();