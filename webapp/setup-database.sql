-- StyleHub Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    sizes TEXT,
    colors TEXT,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    UNIQUE(order_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories are manageable by admins" ON categories;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are manageable by admins" ON products;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update order status" ON orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Create policies for categories (public read access)
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are manageable by admins" ON categories
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

-- Create policies for products (public read access)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products are manageable by admins" ON products
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

-- Create policies for orders (users can only see their own orders)
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

CREATE POLICY "Admins can update order status" ON orders
    FOR UPDATE USING (
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

-- Create policies for order_items
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

-- Insert sample categories
INSERT INTO categories (name) VALUES 
    ('Men'),
    ('Women'),
    ('Kids'),
    ('Accessories'),
    ('Shoes')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, sizes, colors, tags) VALUES 
    (
        'Classic White T-Shirt',
        'A comfortable and stylish white t-shirt made from 100% cotton. Perfect for everyday wear.',
        29.99,
        (SELECT id FROM categories WHERE name = 'Men' LIMIT 1),
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
        'S,M,L,XL,XXL',
        'White,Black,Navy',
        'casual,comfortable,cotton'
    ),
    (
        'Denim Jeans',
        'Classic blue denim jeans with a modern fit. Made from premium denim for durability and comfort.',
        79.99,
        (SELECT id FROM categories WHERE name = 'Men' LIMIT 1),
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
        '28,30,32,34,36,38',
        'Blue,Black',
        'denim,jeans,classic'
    ),
    (
        'Summer Dress',
        'Light and breezy summer dress perfect for warm weather. Features a flattering silhouette.',
        59.99,
        (SELECT id FROM categories WHERE name = 'Women' LIMIT 1),
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
        'XS,S,M,L,XL',
        'Floral,Blue,White',
        'summer,dress,floral'
    ),
    (
        'Running Shoes',
        'High-performance running shoes with excellent cushioning and support for all types of runners.',
        129.99,
        (SELECT id FROM categories WHERE name = 'Shoes' LIMIT 1),
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        '7,8,9,10,11,12',
        'Black,White,Red,Blue',
        'running,athletic,comfortable'
    ),
    (
        'Leather Handbag',
        'Elegant leather handbag perfect for work or casual outings. Features multiple compartments.',
        89.99,
        (SELECT id FROM categories WHERE name = 'Accessories' LIMIT 1),
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
        'One Size',
        'Black,Brown,Tan',
        'leather,handbag,elegant'
    )
ON CONFLICT DO NOTHING;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Create storage policy for product images
CREATE POLICY "Product images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

CREATE POLICY "Admins can update product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

CREATE POLICY "Admins can delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

-- Create site_settings table for managing website configuration
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing site_settings policies if they exist
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
DROP POLICY IF EXISTS "Site settings are manageable by admins" ON site_settings;

-- Create policies for site_settings (public read, admin write)
CREATE POLICY "Site settings are viewable by everyone" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Site settings are manageable by admins" ON site_settings
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES 
    ('site_name', 'StyleHub'),
    ('site_logo', 'https://via.placeholder.com/150x50?text=StyleHub'),
    ('header_wallpaper', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=400&fit=crop'),
    ('business_address', '123 Fashion Street, New York, NY 10001'),
    ('business_phone', '+1 (555) 123-4567'),
    ('business_email', 'info@stylehub.com'),
    ('facebook_url', 'https://facebook.com/stylehub'),
    ('instagram_url', 'https://instagram.com/stylehub'),
    ('twitter_url', 'https://twitter.com/stylehub'),
    ('whatsapp_number', '+15551234567'),
    ('about_us', 'StyleHub is your premier destination for fashion and style.')
ON CONFLICT (setting_key) DO NOTHING;

-- Create storage bucket for site assets (logos, headers)
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing site assets storage policies if they exist
DROP POLICY IF EXISTS "Site assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site assets" ON storage.objects;

-- Create storage policy for site assets
CREATE POLICY "Site assets are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'site-assets' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

CREATE POLICY "Admins can update site assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'site-assets' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );

CREATE POLICY "Admins can delete site assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'site-assets' AND
        auth.jwt() ->> 'email' IN (
            'admin@stylehub.com',
            'admin@example.com'
        )
    );
