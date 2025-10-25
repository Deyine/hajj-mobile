# Khidmaty WebView Integration Guide

## Overview

This document explains how to integrate the Hajj mobile app as a webview within the Khidmaty native application.

## Current Status

Based on testing, the webview is being loaded with:
- **URL**: `https://hajj-mobile.next-version.com/cb`
- **localStorage**: Empty
- **sessionStorage**: Empty
- **URL Parameters**: None

This configuration will **not work** because the Hajj app has no way to authenticate the user.

## Required: Token Passing

The Hajj webview **requires an OIDC access token** to authenticate API calls. The Khidmaty app must pass this token using one of the following methods:

### Option 1: URL Parameter (RECOMMENDED) ✅

Pass the access token directly in the URL:

```
https://hajj-mobile.next-version.com/cb?access_token=<OIDC_ACCESS_TOKEN>
```

**Example:**
```kotlin
// Android WebView
val accessToken = getKhidmatyAccessToken() // Your OIDC token
val url = "https://hajj-mobile.next-version.com/cb?access_token=$accessToken"
webView.loadUrl(url)
```

**Advantages:**
- Simple implementation
- Works immediately
- No need to inject JavaScript

### Option 2: localStorage Injection

Inject the token into localStorage before loading the webview:

```kotlin
// Android WebView
webView.evaluateJavascript("""
    localStorage.setItem('access_token', '$accessToken');
    localStorage.setItem('user_info', '$userInfoJson');
""", null)
webView.loadUrl("https://hajj-mobile.next-version.com/cb")
```

**Important:** The token and user_info must be set **before** loading the URL.

### Option 3: OAuth Code Parameter

If you prefer to use the OAuth flow, pass the authorization code:

```
https://hajj-mobile.next-version.com/cb?code=<AUTHORIZATION_CODE>
```

The webview will exchange the code for tokens using PKCE flow.

## Required Token Format

The access token must be a **valid OIDC Bearer token** from the Khidmaty identity provider.

**Token Requirements:**
- Must be valid and not expired
- Must be issued by: `https://oidc.khidmaty.gov.mr`
- Must grant access to the `/me` endpoint for user info

## User Info Structure (Optional)

If using localStorage method, you can also pre-populate user_info to avoid an extra API call:

```json
{
  "nni": "1234567890",
  "prenomAr": "أحمد",
  "patronymeAr": "محمد",
  "email": "user@example.mr",
  "phone": "22123456",
  "sub": "user-id"
}
```

## Webview Configuration

### Required Permissions

```kotlin
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true  // Required for localStorage
    databaseEnabled = true
}
```

### Recommended Settings

```kotlin
webView.settings.apply {
    // Enable modern web features
    javaScriptEnabled = true
    domStorageEnabled = true
    databaseEnabled = true

    // Cache settings
    cacheMode = WebSettings.LOAD_DEFAULT

    // Enable zoom controls if needed
    setSupportZoom(true)
    builtInZoomControls = true
    displayZoomControls = false
}
```

## Testing & Debugging

### Debug Mode

The webview includes a debug screen that displays:
- Full URL with all parameters
- localStorage contents
- sessionStorage contents
- User agent
- WebView detection status

This information is shown when authentication fails, making it easy to diagnose integration issues.

### Test Checklist

1. ✅ WebView opens the correct URL
2. ✅ Access token is passed (via URL or localStorage)
3. ✅ Token is valid and not expired
4. ✅ localStorage is accessible (domStorageEnabled = true)
5. ✅ Network requests can reach hajj-mobile.next-version.com
6. ✅ API calls to backend can use the token

## Example: Complete Android Integration

```kotlin
class HajjWebViewActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
            }
        }

        setContentView(webView)
        loadHajjApp()
    }

    private fun loadHajjApp() {
        // Get the current user's OIDC access token
        val accessToken = KhidmatyAuth.getAccessToken()

        // Method 1: Pass via URL (RECOMMENDED)
        val url = "https://hajj-mobile.next-version.com/cb?access_token=$accessToken"
        webView.loadUrl(url)

        // Method 2: Inject into localStorage (alternative)
        // webView.evaluateJavascript("""
        //     localStorage.setItem('access_token', '$accessToken');
        // """, null)
        // webView.loadUrl("https://hajj-mobile.next-version.com/cb")
    }
}
```

## API Endpoints Used

The webview makes requests to:
- `https://oidc.khidmaty.gov.mr/me` - To fetch user info from token
- `https://hajj-mobile.next-version.com/api/v1/mobile/*` - Hajj API endpoints

Both require the OIDC access token in the `Authorization: Bearer <token>` header.

## Security Considerations

1. **HTTPS Only**: Always use HTTPS URLs in production
2. **Token Expiration**: The webview will redirect to login if token expires
3. **Token Storage**: Tokens are stored in localStorage (cleared on logout)
4. **No Token Sharing**: Each user must have their own valid token

## Support & Contact

If you encounter issues integrating the webview:

1. **Check Debug Screen**: Authentication errors show detailed debug info
2. **Take Screenshot**: Share the debug information screen
3. **Contact**: Provide the debug info to the Hajj team

## Expected User Flow

```
1. User opens Hajj menu in Khidmaty app
   ↓
2. Khidmaty app opens webview with access_token
   ↓
3. Webview detects token and redirects to /dashboard
   ↓
4. Dashboard loads user's Hajj information
   ↓
5. User can view status, documents, and complete workflow
```

## Troubleshooting

### Problem: "خطأ في التكامل مع تطبيق خدماتي"

**Cause**: No access token was provided.

**Solution**: Pass the token via URL parameter or localStorage (see Options 1 & 2 above).

### Problem: localStorage is empty

**Cause**: Either `domStorageEnabled = false` or token not injected before page load.

**Solution**:
- Enable `domStorageEnabled = true`
- If using localStorage injection, call `evaluateJavascript` before `loadUrl`

### Problem: "Invalid or expired token"

**Cause**: The token is expired or invalid.

**Solution**: Refresh the OIDC token in the Khidmaty app before opening the webview.

---

**Last Updated**: 2025-10-25
