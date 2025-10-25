# Product Details "Not Found" - Debug Instructions

## Issue
Clicking on products shows "Product not found" error even though products exist in admin.

## Quick Test Steps

### Step 1: Test Product Loading
1. Open: http://localhost:3000/user/test-products.html
2. Click "Load Products" button
3. You should see:
   - ✅ Connected to Supabase
   - List of products with IDs
   - Clickable test links

### Step 2: Test a Product Link
1. Click any of the test links on the test page
2. It should open the product details page correctly
3. If it works → the issue is with how product cards generate links
4. If it doesn't work → the issue is with the product-details page itself

### Step 3: Check Browser Console
1. Go to: http://localhost:3000/user/product.html
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Click on any product card
5. Look for these messages:
   ```
   Product ID from URL: [should show a UUID]
   Loading product with ID: [UUID]
   Loaded product: [product object]
   ```

## What I Fixed

### 1. Added Debug Logging
- `user/js/product-details.js` now logs:
  - Product ID from URL
  - Full URL
  - Product loading status
  - Loaded product data
  - Specific error messages

### 2. Enhanced Error Messages
- Error state now shows specific reason for failure
- Console shows detailed error information

### 3. Created Test Page
- `user/test-products.html` - Debug tool to:
  - Test Supabase connection
  - Load and display all products
  - Generate working test links
  - Show product IDs clearly

## Common Issues & Solutions

### Issue 1: Product ID is undefined
**Symptom:** Console shows "Product ID from URL: null"

**Cause:** The onclick handler isn't passing the ID correctly

**Solution:** Check if `product.id` exists in the database
```javascript
// In browser console on product page:
productManager.products
// Should show array with id field for each product
```

### Issue 2: Supabase Connection Failed
**Symptom:** "Error loading product" in console

**Cause:** Supabase client not initialized or API key issue

**Solution:**
1. Check `user/js/supabase.js` has correct URL and key
2. Verify Supabase project is active
3. Check browser network tab for failed requests

### Issue 3: RLS Policy Blocking
**Symptom:** Products load on listing but not on details page

**Cause:** Row Level Security policy might be different

**Solution:** Run this in Supabase SQL Editor:
```sql
-- Check if products are publicly readable
SELECT * FROM products LIMIT 1;

-- If no results, update RLS policy:
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);
```

### Issue 4: Product Not in Database
**Symptom:** "Product not found in database" in console

**Cause:** Product was deleted or never created

**Solution:**
1. Go to Supabase dashboard
2. Check products table has data
3. If empty, run `setup-database.sql` again

## Files Modified

1. **user/js/product-details.js**
   - Added console.log for debugging
   - Enhanced error messages
   - Better error handling

2. **user/test-products.html** (NEW)
   - Debug tool to test product loading
   - Shows product IDs clearly
   - Tests product detail links

3. **DEBUG_PRODUCT_ISSUE.md** (NEW)
   - Detailed debugging guide
   - Common solutions

## Next Steps

1. **Run the test page first:** http://localhost:3000/user/test-products.html
2. **Check if products load** - should see list with IDs
3. **Click a test link** - should open product details
4. **Share console output** if still not working

## Expected Console Output (Success)

When clicking a product, you should see:
```
Product ID from URL: 550e8400-e29b-41d4-a716-446655440000
Full URL: http://localhost:3000/user/product-details.html?id=550e8400-e29b-41d4-a716-446655440000
Loading product with ID: 550e8400-e29b-41d4-a716-446655440000
Loaded product: {id: "550e8400-e29b-41d4-a716-446655440000", name: "Product Name", ...}
```

## Expected Console Output (Error)

If there's an issue, you'll see specific error:
```
Product ID from URL: null
No product ID found in URL
```
OR
```
Product ID from URL: 550e8400-e29b-41d4-a716-446655440000
Loading product with ID: 550e8400-e29b-41d4-a716-446655440000
Loaded product: null
Product not found for ID: 550e8400-e29b-41d4-a716-446655440000
```

This tells us exactly where the problem is!
