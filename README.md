# StyleHub - Online Clothing Store

A fully functional e-commerce web application built with HTML, CSS, JavaScript, and Supabase backend. Features separate user and admin interfaces with real-time database operations, authentication, and image storage.

## 🚀 Features

### User Side (Main Store)
- **Homepage**: Modern responsive design with hero section, featured categories, and latest products
- **Product Browsing**: Dynamic product listing with filters, search, and pagination
- **Product Details**: Detailed product pages with image gallery and add-to-cart functionality
- **Shopping Cart**: Add/remove/update product quantities with local storage
- **Checkout**: Secure checkout process with order creation
- **User Authentication**: Signup, login, logout, and password reset
- **User Profile**: Account management and order history

### Admin Side (Dashboard)
- **Admin Dashboard**: Overview cards showing statistics and recent orders
- **Product Management**: CRUD operations for products with image upload
- **Category Management**: Create, edit, and delete product categories
- **Order Management**: View and update order statuses
- **Admin Authentication**: Secure admin login with role-based access

### Backend (Supabase)
- **Authentication**: User and admin authentication with role-based access
- **Database**: PostgreSQL with tables for categories, products, orders, and order items
- **Storage**: Image upload and management for product photos
- **Real-time**: Live updates across the application

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth

## 📁 Project Structure

```
/clothing-store/
│
├── /user/                    # User-facing website
│   ├── index.html           # Homepage
│   ├── product.html         # Product listing
│   ├── product-details.html # Product details
│   ├── cart.html           # Shopping cart
│   ├── checkout.html       # Checkout process
│   ├── login.html          # User login
│   ├── signup.html         # User registration
│   ├── profile.html        # User profile
│   ├── /css/
│   │   └── style.css       # Custom styles
│   └── /js/
│       ├── supabase.js     # Supabase config
│       ├── auth.js         # Authentication
│       ├── cart.js         # Cart management
│       ├── products.js     # Product operations
│       ├── index.js        # Homepage logic
│       ├── product.js      # Product listing
│       ├── product-details.js # Product details
│       ├── cart-page.js    # Cart page
│       ├── checkout.js     # Checkout logic
│       ├── login.js        # Login logic
│       ├── signup.js       # Signup logic
│       └── profile.js      # Profile management
│
├── /admin/                  # Admin dashboard
│   ├── login.html          # Admin login
│   ├── dashboard.html      # Admin dashboard
│   ├── products.html       # Product management
│   ├── add-product.html    # Add new product
│   ├── categories.html     # Category management
│   ├── orders.html         # Order management
│   └── /js/
│       ├── supabase.js     # Supabase config
│       ├── admin-auth.js   # Admin authentication
│       ├── admin-login.js  # Admin login logic
│       ├── dashboard.js    # Dashboard logic
│       ├── products.js     # Product management
│       ├── add-product.js  # Add product logic
│       ├── categories.js   # Category management
│       └── orders.js       # Order management
│
└── README.md               # This file
```

## 🗄️ Database Schema

### Tables

#### categories
| Field | Type | Description |
|-------|------|-------------|
| id | uuid (primary key) | Unique ID |
| name | text | Category name |
| created_at | timestamp | Creation timestamp |

#### products
| Field | Type | Description |
|-------|------|-------------|
| id | uuid (primary key) | Unique ID |
| name | text | Product name |
| description | text | Product description |
| price | float | Product price |
| category_id | uuid | Foreign key to categories |
| image_url | text | Product image URL |
| sizes | text | Available sizes |
| colors | text | Available colors |
| tags | text | Product tags |
| created_at | timestamp | Creation timestamp |

#### orders
| Field | Type | Description |
|-------|------|-------------|
| id | uuid (primary key) | Unique order ID |
| user_id | uuid | Foreign key to auth.users |
| total_price | float | Total order cost |
| status | text | Order status (pending/shipped/delivered) |
| created_at | timestamp | Creation timestamp |

#### order_items
| Field | Type | Description |
|-------|------|-------------|
| id | uuid (primary key) | Unique ID |
| order_id | uuid | Foreign key to orders |
| product_id | uuid | Foreign key to products |
| quantity | int | Quantity of product |

### Storage
- **Bucket**: `product-images` - Stores product photos

## 🚀 Setup Instructions

### 1. Supabase Setup

Your Supabase project is already configured: `https://imvfdhluvgcwcbzyumvz.supabase.co`

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `imvfdhluvgcwcbzyumvz`
3. Go to **Settings** → **API** to get your anon key
4. Replace `YOUR_ANON_KEY` in both `/user/js/supabase.js` and `/admin/js/supabase.js`:

```javascript
const SUPABASE_URL = 'https://imvfdhluvgcwcbzyumvz.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ACTUAL_ANON_KEY_HERE';
```

📋 **Detailed setup guide**: See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

### 2. Database Setup

**Easy way**: Copy and paste the entire contents of `setup-database.sql` into your Supabase SQL Editor and click **Run**.

**Manual way**: Run these SQL commands in your Supabase SQL editor:

```sql
-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    sizes TEXT,
    colors TEXT,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
```

### 3. Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `product-images`
3. Set the bucket to public
4. Configure the following policy:

```sql
-- Allow public read access to product images
CREATE POLICY "Product images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
```

### 4. Admin Setup

1. Create an admin user account through the signup process
2. Update the admin emails list in `/admin/js/supabase.js`:

```javascript
const ADMIN_EMAILS = [
    'admin@stylehub.com',
    'your-admin-email@example.com'
];
```

### 5. Run the Application

1. Open `/user/index.html` in your browser to access the main store
2. Open `/admin/login.html` in your browser to access the admin dashboard
3. Use the admin credentials to manage products, categories, and orders

## 🎨 Customization

### Styling
- Modify `/user/css/style.css` for custom styles
- Tailwind CSS classes are used throughout for responsive design
- Color scheme can be changed by updating Tailwind classes

### Features
- Add new product fields by updating the database schema and forms
- Implement payment processing by integrating with Stripe or PayPal
- Add email notifications using Supabase Edge Functions
- Implement inventory management with stock tracking

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- Admin role-based access control
- Input validation and sanitization
- Secure image upload with file type validation
- Password strength requirements

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive grid layouts
- Touch-friendly interface elements
- Optimized for all screen sizes

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Environment Variables
For production, consider using environment variables for:
- Supabase URL and keys
- Admin email lists
- API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔄 Updates

### Version 1.0.0
- Initial release
- Complete user and admin interfaces
- Supabase integration
- Responsive design
- Authentication system
- Order management

---

**Built with ❤️ using Supabase and modern web technologies**

