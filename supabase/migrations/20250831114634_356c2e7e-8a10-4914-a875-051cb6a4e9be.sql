-- Fix security vulnerability: Remove overly permissive policies and add proper access controls

-- Drop existing overly permissive policies for videos table
DROP POLICY IF EXISTS "Public delete access for videos" ON public.videos;
DROP POLICY IF EXISTS "Public insert access for videos" ON public.videos;
DROP POLICY IF EXISTS "Public update access for videos" ON public.videos;

-- Drop existing overly permissive policies for video_links table  
DROP POLICY IF EXISTS "Public delete" ON public.video_links;
DROP POLICY IF EXISTS "Public insert" ON public.video_links;
DROP POLICY IF EXISTS "Public update" ON public.video_links;

-- Create secure policies for videos table
-- Allow public read access (for viewing videos)
CREATE POLICY "Anyone can view videos" ON public.videos
  FOR SELECT USING (true);

-- Require authentication for content management
CREATE POLICY "Authenticated users can insert videos" ON public.videos
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos" ON public.videos
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete videos" ON public.videos
  FOR DELETE TO authenticated
  USING (true);

-- Create secure policies for video_links table
-- Allow public read access (for viewing video links)
CREATE POLICY "Anyone can view video links" ON public.video_links
  FOR SELECT USING (true);

-- Require authentication for content management
CREATE POLICY "Authenticated users can insert video links" ON public.video_links
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update video links" ON public.video_links
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete video links" ON public.video_links
  FOR DELETE TO authenticated
  USING (true);