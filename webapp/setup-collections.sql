-- Collections and Site Settings Extension
-- Run this in your Supabase SQL Editor after setup-database.sql

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_products junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS collection_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Collections are viewable by everyone" ON collections;
DROP POLICY IF EXISTS "Collections are manageable by admins" ON collections;
DROP POLICY IF EXISTS "Collection products are viewable by everyone" ON collection_products;
DROP POLICY IF EXISTS "Collection products are manageable by admins" ON collection_products;

-- Create policies for collections (public read access)
CREATE POLICY "Collections are viewable by everyone" ON collections
    FOR SELECT USING (true);

CREATE POLICY "Collections are manageable by admins" ON collections
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

-- Create policies for collection_products (public read access)
CREATE POLICY "Collection products are viewable by everyone" ON collection_products
    FOR SELECT USING (true);

CREATE POLICY "Collection products are manageable by admins" ON collection_products
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

-- Insert delivery and tax settings
INSERT INTO site_settings (setting_key, setting_value) VALUES 
    ('delivery_charge', '5.99'),
    ('tax_rate', '8.5'),
    ('free_delivery_threshold', '50.00')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Insert sample collections
INSERT INTO collections (name, description, image_url, is_active, display_order) VALUES 
    ('New Arrivals', 'Check out our latest products', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop', true, 1),
    ('Best Sellers', 'Our most popular items', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop', true, 2),
    ('Summer Collection', 'Perfect for the warm season', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop', true, 3),
    ('Winter Essentials', 'Stay warm and stylish', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop', true, 4)
ON CONFLICT (name) DO NOTHING;

-- Create storage bucket for collection images
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('collection-images', 'collection-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing collection images storage policies if they exist
DROP POLICY IF EXISTS "Collection images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload collection images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update collection images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete collection images" ON storage.objects;

-- Create storage policy for collection images
CREATE POLICY "Collection images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'collection-images');

CREATE POLICY "Admins can upload collection images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'collection-images' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

CREATE POLICY "Admins can update collection images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'collection-images' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

CREATE POLICY "Admins can delete collection images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'collection-images' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );
