# Hajj Mobile App - Deployment Guide

## Quick Deployment

To deploy the latest version of the mobile app:

```bash
./deploy.sh
```

## What the deployment script does

1. **Adds SSH keys** - Ensures git pull can access the repository
2. **Pulls latest code** - Gets the most recent version from `main` branch
3. **Installs dependencies** - Runs `npm install` to update packages
4. **Builds the app** - Creates production-ready files in `dist/` directory
5. **Shows summary** - Displays build information

## Prerequisites

- Node.js and npm installed
- SSH key configured at `~/.ssh/id_rsa_all`
- Git repository access
- Nginx already configured to serve from `dist/` directory

## Manual Deployment Steps

If you need to deploy manually:

```bash
# 1. Add SSH keys
ssh-add -D
ssh-add ~/.ssh/id_rsa_all

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Build application
npm run build
```

## Post-Deployment

- Nginx will automatically serve the new files from `dist/`
- Users may need to clear browser cache to see changes
- Check browser console for any errors after deployment

## Troubleshooting

**SSH key errors:**
- Ensure `~/.ssh/id_rsa_all` exists and has correct permissions
- Try: `chmod 600 ~/.ssh/id_rsa_all`

**Build fails:**
- Check Node.js version (requires v18+)
- Delete `node_modules` and run `npm install` again
- Check for syntax errors in code

**Changes not visible:**
- Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- Clear browser cache
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
