# Backend /cb Callback Deployment Guide

## Overview

We've transformed `/cb` from a frontend route to a **backend API endpoint** that:
1. ✅ **Logs EVERYTHING** - All headers, cookies, query params, body
2. ✅ **Extracts tokens** - From 10+ different sources (headers, params, cookies, etc.)
3. ✅ **Redirects smartly** - To dashboard with token OR to frontend with debug info

## What Changed

### Before
```
Khidmaty → https://hajj-mobile.next-version.com/cb (Frontend React)
           ↓
           JavaScript can't see HTTP headers ❌
```

### After
```
Khidmaty → https://hajj-mobile.next-version.com/cb (Backend Rails)
           ↓
           Backend logs EVERYTHING ✅
           ↓
           Redirects to frontend with token or debug info
```

## Deployment Steps

### 1. Deploy Backend (Already Pushed)

```bash
# On your server
cd /var/www/hajj-webapp
git pull origin main
bundle install  # If needed
touch tmp/restart.txt  # Restart Puma
```

**Verify backend route:**
```bash
# Should see the route
rails routes | grep "/cb"
# Output: GET  /cb  api/v1/mobile#oauth_callback
```

### 2. Update Nginx Configuration

**File**: `/etc/nginx/sites-available/hajj-mobile.next-version.com`

Add this **BEFORE** the existing `/api/` location block:

```nginx
# Proxy /cb to backend for OAuth callback handling
location = /cb {
    proxy_pass https://hajj-api.next-version.com/cb;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
    proxy_redirect off;

    # Preserve all query parameters
    proxy_pass_request_headers on;

    # Enable cookies
    proxy_cookie_path / /;
}
```

**Test nginx config:**
```bash
sudo nginx -t
```

**Reload nginx:**
```bash
sudo systemctl reload nginx
```

### 3. Deploy Frontend (Already Pushed)

```bash
cd /var/www/hajj-mobile
git pull origin main
npm install  # If needed
npm run build
```

The frontend now:
- Decodes backend debug info from `?debug=` parameter
- Displays comprehensive backend logs in RED box
- Shows all headers, cookies, query params, body

## Testing

### Test 1: Direct Access to /cb

```bash
# From your local machine or server
curl -I https://hajj-mobile.next-version.com/cb

# Should see:
# HTTP/1.1 302 Found
# Location: https://hajj-mobile.next-version.com/cb?debug=...
```

### Test 2: Check Backend Logs

```bash
# On server
tail -f /var/www/hajj-webapp/log/production.log

# Then access: https://hajj-mobile.next-version.com/cb
# You should see:
# ================================================================================
# OAUTH CALLBACK RECEIVED
# ================================================================================
# ... all request details ...
```

### Test 3: In Browser

Visit: `https://hajj-mobile.next-version.com/cb`

You should:
1. See a brief redirect
2. Land on `/cb?debug=...` with error screen
3. See a **RED BOX** titled "🔴 BACKEND /CB CALLBACK DATA"
4. Inside: All headers, query params, cookies, etc.

### Test 4: With Token

```bash
# Test with a fake token
curl -L "https://hajj-mobile.next-version.com/cb?access_token=test123"

# Check logs - should see:
# ✅ TOKEN FOUND: test123...
# (Then redirects to dashboard)
```

## What the Backend Logs

When Khidmaty loads `/cb`, the backend will log:

```
================================================================================
OAUTH CALLBACK RECEIVED
================================================================================
Timestamp: 2025-10-25T12:34:56Z
Method: GET
Full URL: https://hajj-mobile.next-version.com/cb?param=value
Query String: param=value
--------------------------------------------------------------------------------
Query Params:
{
  "param": "value"
}
--------------------------------------------------------------------------------
Headers:
{
  "Accept": "...",
  "Authorization": "Bearer ...",  ← IF they send it
  "User-Agent": "...",
  "X-Custom-Header": "...",       ← Any custom headers
  ...all headers...
}
--------------------------------------------------------------------------------
Cookies:
{
  "session": "...",
  "token": "..."                  ← IF they set cookies
}
--------------------------------------------------------------------------------
Body: (any POST body data)
================================================================================
```

## Token Detection Sources (in order)

The backend checks these 10+ sources:

1. ✅ `Authorization: Bearer <token>` header
2. ✅ `?access_token=` query param
3. ✅ `?token=` query param
4. ✅ `?code=` query param
5. ✅ `X-Access-Token` header
6. ✅ `X-Token` header
7. ✅ `X-Khidmaty-Token` header
8. ✅ `access_token` cookie
9. ✅ `token` cookie
10. ✅ `khidmaty_token` cookie
11. ✅ JSON body with `access_token` or `token`

**If token found:** Redirects to `/dashboard?access_token=<token>`
**If no token:** Redirects to `/cb?debug=<base64_debug_info>`

## Viewing Debug Info in APK

When Khidmaty loads the webview:

1. Khidmaty app opens: `https://hajj-mobile.next-version.com/cb`
2. Nginx proxies to backend: `https://hajj-api.next-version.com/cb`
3. Backend logs everything to server logs
4. Backend encodes debug info and redirects: `/cb?debug=eyJ0aW1lc3RhbXAi...`
5. Frontend decodes and displays in **RED BOX**

**Screenshot the RED BOX** - it will show EXACTLY what the backend received!

## Checking Server Logs

```bash
# Real-time logs
tail -f /var/www/hajj-webapp/log/production.log

# Search for callback logs
grep -A 50 "OAUTH CALLBACK RECEIVED" /var/www/hajj-webapp/log/production.log | tail -100

# Last 100 lines of logs
tail -100 /var/www/hajj-webapp/log/production.log
```

## Reverting (If Needed)

If you need to revert to frontend-only `/cb`:

1. **Remove nginx proxy for `/cb`**
2. **Reload nginx**: `sudo systemctl reload nginx`
3. The frontend route `/cb` will work again

But this new approach is **much better for debugging**!

## What to Share with Khidmaty Team

The URL doesn't change - still:
```
https://hajj-mobile.next-version.com/cb
```

But now we can:
- ✅ See server logs with ALL request details
- ✅ See debug info on screen (if no token found)
- ✅ Support ANY token-passing method

No changes needed on their end unless they want to pass the token via URL parameter.

## Next Steps

1. ✅ Deploy backend and frontend (DONE)
2. ✅ Update nginx config (instructions above)
3. ⏳ Test in Khidmaty APK
4. 📸 Screenshot the RED BOX or check server logs
5. 🎯 Finally know how they're sending the token!

---

**Last Updated**: 2025-10-25
