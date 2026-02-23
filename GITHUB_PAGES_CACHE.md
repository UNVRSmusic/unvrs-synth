# GitHub Pages Cache Configuration Guide

## 📝 Note on GitHub Pages Limitations

GitHub Pages has limited control over HTTP headers. Unlike Netlify or Vercel, you cannot directly set custom cache-control headers for individual file types.

**Workarounds:**

### Option 1: Use Netlify (Recommended)

Connected to the same GitHub repository, Netlify provides full cache control via `netlify.toml`:

```bash
# Push to GitHub, Netlify auto-deploys with proper headers
git push origin main
```

### Option 2: GitHub Pages + CDN (CloudFlare)

Combine GitHub Pages with CloudFlare for header management:

1. Point domain to CloudFlare nameservers
2. Add cache rules in CloudFlare dashboard
3. CloudFlare caches with rules:
   ```
   /assets/* → Cache 1 year
   /index.html → Cache 1 hour
   ```

### Option 3: Manual JekyllExclusion (Advanced)

Create `.nojekyll` file to prevent Jekyll processing (already optimized in build).

---

## 🔄 Current Setup

### What's Configured

✅ **Vite Build Configuration** → Code splitting + minification
✅ **Content Hashing** → Automatic via Vite (filenames include hash)
✅ **Netlify Configuration** → Ready to deploy when switching
✅ **Cache Expiration Rules** → Defined in `netlify.toml` and `_headers`

### GitHub Pages Deployment

```bash
# Build locally
npm run build

# The dist/ folder contains:
# - index.html (entry point)
# - assets/vendor-[HASH].js (React libraries - 1 year cache)
# - assets/audio-[HASH].js (Audio engine - 1 year cache)
# - assets/index-[HASH].js (Main app - 1 year cache)
# - assets/index-[HASH].css (Styles - 1 year cache)

# Deploy to GitHub Pages
npm run deploy
```

**GitHub Pages Default Headers:**

```
Cache-Control: public, max-age=600
```

(10 minutes for everything)

---

## ⚡ Performance Impact

### With GitHub Pages (10 min cache)

- First visit: 70 kB download
- Return visit (5 min later): 70 kB download again ❌

### With Netlify + Cache Rules (configured)

- First visit: 70 kB download ✓
- Return visit (anytime): Serve from cache ✓
- Browser cache: 1 year for assets ✓

---

## 🚀 Migration Path

### Step 1: Test Locally

```bash
npm run preview  # Test production build locally
```

### Step 2: Deploy to Netlify

```bash
# Connect GitHub repo to Netlify in dashboard
# Netlify detects netlify.toml and applies configuration automatically
git push  # Netlify auto-deploys with proper cache headers
```

### Step 3: Verify Cache Headers

```bash
# Check response headers
curl -I https://your-netlify-site.netlify.app/assets/vendor-*.js
# Should show: Cache-Control: public, max-age=31536000, immutable

curl -I https://your-netlify-site.netlify.app/index.html
# Should show: Cache-Control: public, max-age=3600, must-revalidate
```

---

## 📊 Expected Improvements

| Metric             | Before              | After (Netlify)          |
| ------------------ | ------------------- | ------------------------ |
| Repeat visit load  | 70 kB               | ~1 kB (HTML only)        |
| Repeat visit speed | Same as first       | 10x faster               |
| Server bandwidth   | 10x per user visit  | 1x initial + metadata    |
| Cache hit rate     | 10% (10 min window) | 95%+ (1 year for assets) |

---

## 🔗 Related Files

- `netlify.toml` → Netlify deployment configuration
- `_headers` → Alternative Netlify header syntax
- `vite.config.ts` → Build optimization configuration
- `dist/` → Optimized build output with content hashing

---

For more details, see: [PAGESPEED_AUDIT.md](./PAGESPEED_AUDIT.md)
