CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 100),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 1200),
  category TEXT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('Angebot', 'Gesuch')),
  place TEXT NOT NULL CHECK (char_length(place) BETWEEN 2 AND 100),
  postal_code TEXT NOT NULL CHECK (postal_code ~ '^[0-9]{5}$'),
  condition TEXT NOT NULL,
  offer_kind TEXT NOT NULL,
  delivery TEXT[] NOT NULL DEFAULT '{}',
  level TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  materials TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings are publicly readable" ON public.listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create their own listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can view listing photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'listing-photos');
CREATE POLICY "Users can upload listing photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update their listing photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their listing photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = auth.uid()::text);