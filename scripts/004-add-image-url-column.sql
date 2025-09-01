-- Add image_url column to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN image_url TEXT;

-- Create storage bucket for journal images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('journal-images', 'journal-images', true);

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Users can upload journal images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'journal-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to view their own images
CREATE POLICY "Users can view journal images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'journal-images'
);

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own journal images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'journal-images' 
  AND auth.role() = 'authenticated'
);
