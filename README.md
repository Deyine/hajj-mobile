# Hajj Mobile WebView Application

A React-based web application designed to be embedded as a webview in a government mobile application, with authentication via Khidmaty OIDC.

## Tech Stack

- **React** 19.1.1 - Latest version
- **React Router DOM** 6.21.1 - For routing
- **Vite** 7.1.7 - Build tool and dev server
- **Tailwind CSS** 3.4.1 - Utility-first CSS framework
- **DaisyUI** 5.3.7 - Tailwind component library
- **Axios** 1.6.5 - HTTP client
- **jsPDF** 2.5.1 + **jsPDF-AutoTable** 3.8.0 - PDF generation
- **XLSX** 0.18.5 - Excel file handling

## Features

- RTL support enabled (right-to-left for Arabic)
- Custom Arabic font: Noto Naskh Arabic
- Custom DaisyUI theme named "quran"
- API proxy configured in Vite to proxy `/api` requests to `http://localhost:3000`
- OIDC integration with Khidmaty government identity provider

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will run on `http://localhost:3005`

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## OIDC Integration (Khidmaty)

### Configuration

- **Auth Server**: `https://oidc.khidmaty.gov.mr`
- **Client ID**: `oidcTest` (replace with your client ID)
- **Redirect URI**: `http://localhost:3005/cb`
- **Scopes**: `openid email profile phone address offline_access api:read`

### Endpoints

- **Authorization**: `https://oidc.khidmaty.gov.mr/auth`
- **Token**: `https://oidc.khidmaty.gov.mr/token`
- **User Info**: `https://oidc.khidmaty.gov.mr/me`
- **JWKS**: `https://oidc.khidmaty.gov.mr/jwks`
- **Logout**: `https://oidc.khidmaty.gov.mr/session/end`

### Available User Claims

Standard OIDC claims plus Mauritanian-specific claims:
- `nni` - National Identification Number
- `patronymeAr/patronymeFr` - Family name (Arabic/French)
- `perePrenomAr/perePrenomFr` - Father's name (Arabic/French)
- `prenomAr/prenomFr` - First name (Arabic/French)
- `sexeCode` - Gender code
- `dateNaissance` - Date of birth
- `lieuNaissanceAr/lieuNaissanceFr` - Place of birth (Arabic/French)
- `numeroTelephone` - Phone number
- `nationalities/nationalitiesAr` - Nationalities

### Security

- PKCE (Proof Key for Code Exchange) is supported and recommended
- Supported code challenge method: `S256`
- Access tokens are stored in localStorage

## Project Structure

```
hajj-mobile/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API and service configurations
│   │   └── api.js      # Axios instance configuration
│   ├── utils/          # Utility functions
│   ├── styles/         # CSS files
│   │   └── index.css   # Main CSS with Tailwind
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## API Configuration

The Axios instance is configured with:
- Base URL: `/api` (proxied to `http://localhost:3000`)
- Automatic Bearer token injection from localStorage
- 401 redirect to login page

## Custom Theme

The "quran" DaisyUI theme uses the following color palette:
- Primary: `#2C5F2D`
- Secondary: `#97CC04`
- Accent: `#00A651`
- Neutral: `#2A2E37`
- Base: `#FFFFFF`
