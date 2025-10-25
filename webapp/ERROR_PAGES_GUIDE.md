# Error Pages Guide - StyleHub

## Error Pages Overview

The webapp has three types of error handling:

### 1. 404 Page - Page Not Found
**File:** `404.html`
**When to use:** When a page/route doesn't exist
**URL:** `http://localhost:3000/404.html`

### 2. 500 Page - Server Error
**File:** `500.html`
**When to use:** When server encounters an error
**URL:** `http://localhost:3000/500.html`

### 3. Product Not Available - In-App Error
**Location:** `user/product-details.html` (error state)
**When to use:** When a specific product isn't found
**Not a separate page** - Shows within the app

---

## Error Page Locations

```
webapp/
├── 404.html          # Page Not Found
├── 500.html          # Server Error
└── user/
    └── product-details.html  # Has built-in error state
```

---

## When Each Error Shows

### 404 - Page Not Found
**Triggers:**
- User types wrong URL
- Link to non-existent page
- Deleted page
- Typo in URL

**Example URLs that should show 404:**
- `http://localhost:3000/nonexistent.html`
- `http://localhost:3000/user/missing-page.html`
- `http://localhost:3000/admin/fake-page.html`

### 500 - Server Error
**Triggers:**
- Server crash
- Database connection failure
- Unhandled exception
- Server misconfiguration

**Note:** With `npx serve`, you won't see 500 errors often. They're more common in production.

### Product Not Available (In-App)
**Triggers:**
- Product ID not in URL
- Product deleted from database
- Invalid product ID
- Product doesn't exist

**Example:**
- `http://localhost:3000/user/product-details.html` (no ID)
- `http://localhost:3000/user/product-details.html?id=invalid-id`

---

## How to Test Error Pages

### Test 404 Page
```
1. Go to: http://localhost:3000/nonexistent.html
2. Should show 404 page
3. Click "Go to Store" → should go to home
4. Click "Go to Admin" → should go to admin dashboard
```

### Test 500 Page
```
1. Go to: http://localhost:3000/500.html
2. Should show 500 page
3. Click buttons to navigate
```

### Test Product Not Available
```
1. Go to: http://localhost:3000/user/product-details.html
   (no product ID)
2. Should show "Product Not Available" error
3. Click "Browse All Products" → goes to product listing
4. Click "Go to Home" → goes to homepage
```

---

## Error Page Features

### 404.html
```html
✅ Clean, modern design
✅ Clear error message
✅ Two action buttons:
   - Go to Store (primary)
   - Go to Admin (secondary)
✅ Responsive layout
✅ Font Awesome icons
✅ Tailwind CSS styling
```

### 500.html
```html
✅ Different icon (bolt) to distinguish from 404
✅ Yellow color scheme (warning)
✅ Same navigation options
✅ Responsive layout
```

### Product Not Available (In-App)
```html
✅ Orange color scheme (different from 404/500)
✅ Box icon (product-related)
✅ Dynamic error message
✅ Two action buttons:
   - Browse All Products
   - Go to Home
✅ Stays within app (not separate page)
✅ Maintains navigation/footer
```

---

## Configuring Error Pages with Server

### For Development (npx serve)
`npx serve` doesn't automatically use custom 404 pages. To test:
1. Navigate directly to error pages
2. Or use a different server

### For Production (Netlify/Vercel)
Create a config file:

**netlify.toml:**
```toml
[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404

[[redirects]]
  from = "/*"
  to = "/500.html"
  status = 500
```

**vercel.json:**
```json
{
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "status": 404,
      "dest": "/404.html"
    }
  ]
}
```

---

## Improving Error Handling

### Current State
✅ 404 page exists
✅ 500 page exists
✅ Product error state improved
✅ Multiple navigation options
✅ Responsive design

### Future Enhancements

#### 1. Add Error Logging
```javascript
// Log errors to console or service
function logError(errorType, details) {
    console.error(`[${errorType}]`, details);
    // Could send to error tracking service
}
```

#### 2. Add "Report Problem" Button
```html
<a href="mailto:support@stylehub.com?subject=Error Report">
    Report this issue
</a>
```

#### 3. Add Search on 404
```html
<div class="mt-6">
    <input type="text" placeholder="Search for products..." 
           class="px-4 py-2 border rounded-lg">
</div>
```

#### 4. Show Recent Products on Error
```javascript
// On product not found, show similar products
async function showAlternatives() {
    const products = await loadRecentProducts(4);
    renderProductSuggestions(products);
}
```

---

## Error Messages Reference

### Product Not Available Messages

**No Product ID:**
```
"No product ID provided. Please select a product from the catalog."
```

**Product Not Found:**
```
"This product may have been removed or is temporarily unavailable."
```

**Database Error:**
```
"Unable to load product details. Please try again later."
```

---

## Troubleshooting

### Issue: 404 Page Not Showing
**Problem:** Navigating to wrong URL shows blank page

**Solution:**
1. Check if 404.html exists in root
2. Verify server configuration
3. For `npx serve`, navigate directly to `/404.html`

### Issue: Product Error Shows Instead of 404
**Problem:** Missing product shows in-app error, not 404

**This is correct behavior!**
- In-app errors (like missing product) should stay in the app
- 404 is for missing pages/routes
- Different use cases

### Issue: Error Pages Look Different
**Problem:** Styling doesn't match

**Solution:**
1. All error pages use Tailwind CDN
2. Check if CDN is loading
3. Verify internet connection
4. Check browser console for errors

---

## Best Practices

### 1. Use Appropriate Error Type
- **404** → Missing page/route
- **500** → Server/database error
- **In-app error** → Missing data (like product)

### 2. Provide Clear Actions
✅ Always offer way to navigate back
✅ Provide multiple options
✅ Make buttons obvious and clickable

### 3. Keep Messages User-Friendly
❌ "Error: NULL_REFERENCE_EXCEPTION"
✅ "This product is temporarily unavailable"

### 4. Log Errors for Debugging
```javascript
console.error('Product not found:', productId);
// In production, send to error tracking
```

### 5. Test All Error Scenarios
- Missing pages
- Invalid product IDs
- Database connection failures
- Network errors

---

## Summary

### Error Handling Strategy

```
User Action → Error Type → Response
─────────────────────────────────────
Wrong URL → 404 Page → Show 404.html
Server crash → 500 Page → Show 500.html
Missing product → In-app error → Show error state
Invalid ID → In-app error → Show error state
No network → In-app error → Show error message
```

### Key Points

1. **404 and 500 are separate HTML files** in the root directory
2. **Product errors show within the app** (not separate page)
3. **All errors provide navigation options** to get back
4. **Error messages are user-friendly** and actionable
5. **Errors are logged** for debugging

---

## Testing Checklist

- [ ] 404 page loads at `/404.html`
- [ ] 500 page loads at `/500.html`
- [ ] Product details shows error for missing ID
- [ ] Product details shows error for invalid ID
- [ ] All error pages have working navigation buttons
- [ ] Error pages are responsive on mobile
- [ ] Error messages are clear and helpful
- [ ] Console logs errors for debugging

---

## Files to Review

1. **404.html** - Page not found
2. **500.html** - Server error
3. **user/product-details.html** - Contains error state (line 71-89)
4. **user/js/product-details.js** - Error handling logic

All error handling is now properly configured! ✅
