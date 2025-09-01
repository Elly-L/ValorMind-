-- Create storage bucket for journal images
INSERT INTO storage.buckets (id, name, public) VALUES ('journal-images', 'journal-images', true);

-- Set up RLS policies for the storage bucket
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to images (since bucket is public)
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'journal-images');
