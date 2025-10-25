# OIDC Registration Information

## Application Details

**Application Name:** Hajj Mobile App
**Domain:** hajj-mobile.next-version.com
**Environment:** Production

---

## Required Configuration

### 1. REDIRECT_URI (Callback URL)
```
https://hajj-mobile.next-version.com/cb
```

**Description:** After successful authentication, OIDC will redirect users to this URL with the authorization code.

---

### 2. LOGOUT_URL (Post Logout Redirect URI)
```
https://hajj-mobile.next-version.com
```

**Description:** After logout, users will be redirected to this URL (the application home page).

---

### 3. Application Logo

**Format:** PNG or SVG
**Recommended Size:** 512x512px or higher
**File:** [Logo file to be provided]

**Note:** The logo will be displayed on the OIDC login page to identify the Hajj Mobile application.

---

## Additional Information

**Client Type:** Public Web Application (SPA - Single Page Application)
**Technology:** React with Vite
**Authentication Flow:** Authorization Code Flow with PKCE (Proof Key for Code Exchange)

**Scopes Requested:**
- `openid` - Required for OIDC
- `email` - User email address
- `profile` - User profile information
- `phone` - Phone number
- `address` - Address information
- `offline_access` - Refresh token support
- `api:read` - API read access

---

## Security Notes

- The application uses PKCE for enhanced security
- All communication with OIDC happens over HTTPS
- Access tokens are stored securely in browser storage
- Refresh tokens are used for token renewal

---

## Contact

For any questions or issues regarding this OIDC registration, please contact:
- **Project:** Hajj Management System
- **Component:** Mobile Citizen Portal
