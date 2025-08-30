-- Create videos table as requested
CREATE TABLE public.videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public video hub)
CREATE POLICY "Public read access for videos" 
ON public.videos 
FOR SELECT 
USING (true);

CREATE POLICY "Public insert access for videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public update access for videos" 
ON public.videos 
FOR UPDATE 
USING (true);

CREATE POLICY "Public delete access for videos" 
ON public.videos 
FOR DELETE 
USING (true);

-- Insert some sample Islamic video data
INSERT INTO public.videos (title, url, thumbnail, category) VALUES
('قراءة سورة البقرة - محمد صديق المنشاوي', 'https://www.youtube.com/watch?v=sample1', 'https://img.youtube.com/vi/sample1/mqdefault.jpg', 'قرآن كريم'),
('خطبة الجمعة - فضل الصلاة', 'https://www.youtube.com/watch?v=sample2', 'https://img.youtube.com/vi/sample2/mqdefault.jpg', 'خطب'),
('سيرة النبي محمد صلى الله عليه وسلم', 'https://www.youtube.com/watch?v=sample3', 'https://img.youtube.com/vi/sample3/mqdefault.jpg', 'سيرة نبوية');