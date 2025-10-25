# Supabase Setup Guide for StyleHub

## 🚀 Quick Setup

### 1. Get Your Supabase Anon Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: `imvfdhluvgcwcbzyumvz`
3. Go to **Settings** → **API**
4. Copy the **anon/public** key
5. Replace `YOUR_ANON_KEY` in the following files:
   - `user/js/supabase.js`
   - `admin/js/supabase.js`

### 2. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `setup-database.sql`
4. Click **Run** to execute the script

This will create:
- ✅ Database tables (categories, products, orders, order_items)
- ✅ Row Level Security policies
- ✅ Sample data (categories and products)
- ✅ Storage bucket for product images
- ✅ Storage policies for image uploads

### 3. Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Enable **Email** authentication
3. Configure **Site URL** to your domain (e.g., `http://localhost:3000` for local development)
4. Add your domain to **Redirect URLs**

### 4. Set Up Admin Users

The database is configured to allow admin access for users with these email addresses:
- `admin@stylehub.com`
- `admin@example.com`

To add more admin users, update the policies in the database or modify the email list in `setup-database.sql`.

### 5. Test the Integration

1. Open `user/index.html` in your browser
2. Check the browser console for any errors
3. Try to load products and categories
4. Test user registration and login

## 📊 Database Schema

### Tables Created:

#### `categories`
- `id` (UUID, Primary Key)
- `name` (Text, Unique)
- `created_at` (Timestamp)

#### `products`
- `id` (UUID, Primary Key)
- `name` (Text)
- `description` (Text)
- `price` (Decimal)
- `category_id` (UUID, Foreign Key)
- `image_url` (Text)
- `sizes` (Text)
- `colors` (Text)
- `tags` (Text)
- `created_at` (Timestamp)

#### `orders`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `total_price` (Decimal)
- `status` (Text: 'pending', 'shipped', 'delivered')
- `created_at` (Timestamp)

#### `order_items`
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (Integer)

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Public read access** for categories and products
- **User-specific access** for orders (users can only see their own)
- **Admin-only access** for create/update/delete operations
- **Secure storage policies** for product images

## 🛠️ Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Make sure you've replaced `YOUR_ANON_KEY` with your actual anon key
   - Check that the key is copied correctly (no extra spaces)

2. **"Permission denied" error**
   - Check that RLS policies are set up correctly
   - Verify user authentication status
   - Check admin email configuration

3. **Products not loading**
   - Verify the database schema was created successfully
   - Check browser console for specific error messages
   - Ensure sample data was inserted

4. **Image upload not working**
   - Check storage bucket exists (`product-images`)
   - Verify storage policies are set up
   - Check admin authentication for upload permissions

### Debug Steps:

1. Open browser developer tools (F12)
2. Check the **Console** tab for errors
3. Check the **Network** tab for failed requests
4. Verify Supabase connection in the console:
   ```javascript
   console.log('Supabase client:', supabase);
   ```

## 📱 Features Enabled

After setup, your website will have:

- ✅ **User Authentication** (Sign up, Login, Logout)
- ✅ **Product Management** (View, Add, Edit, Delete)
- ✅ **Category Management** (View, Add, Edit, Delete)
- ✅ **Shopping Cart** (Add, Remove, Update quantities)
- ✅ **Order Management** (Create orders, View order history)
- ✅ **Image Upload** (Product images to Supabase Storage)
- ✅ **Real-time Updates** (Live data from Supabase)
- ✅ **Responsive Design** (Mobile, Tablet, Desktop)

## 🔄 Next Steps

1. Replace `YOUR_ANON_KEY` with your actual key
2. Run the database setup script
3. Test the website functionality
4. Customize admin email addresses
5. Add your own product images
6. Deploy to your hosting platform

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase project settings
3. Ensure all database tables and policies are created
4. Test with the sample data first before adding custom content
