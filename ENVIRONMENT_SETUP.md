# Environment Setup Guide

This guide covers setting up the Saraya Butchery project on Windows, macOS, and Linux for both web and mobile development.

## 🎯 Quick Start (All Platforms)

```bash
# 1. Clone the repository
git clone https://github.com/TigerDragonFury/SarayaButchery.git
cd SarayaButchery

# 2. Run setup script
npm run setup

# 3. Install dependencies
npm install

# 4. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 5. Start development
npm run dev
```

## 🔧 Detailed Setup by Platform

### Windows

#### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/download/win))
- VS Code ([Download](https://code.visualstudio.com/))

#### Setup Steps
```powershell
# 1. Clone repository
git clone https://github.com/TigerDragonFury/SarayaButchery.git
cd SarayaButchery

# 2. Install dependencies (PowerShell or CMD)
npm install

# 3. Copy environment template
copy .env.example .env.local

# 4. Edit .env.local with your values
# Use Notepad or VS Code
notepad .env.local

# 5. Start development server
npm run dev
```

#### Path Issues & Solutions
- Use forward slashes `/` in all CLI commands
- Or use double backslashes `\\` in comments
- npm handles path conversion automatically

### macOS

#### Prerequisites
```bash
# Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Git (comes with Xcode)
xcode-select --install
```

#### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/TigerDragonFury/SarayaButchery.git
cd SarayaButchery

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Edit environment variables
nano .env.local
# or use VS Code
code .env.local

# 5. Start development
npm run dev
```

#### For iOS Development
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods (if for iOS builds)
sudo gem install cocoapods

# Install Xcode (from App Store)
```

### Linux (Ubuntu/Debian)

#### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs

# Install Git
sudo apt install git

# Install build essentials
sudo apt install build-essential python3
```

#### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/TigerDragonFury/SarayaButchery.git
cd SarayaButchery

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Edit environment variables
nano .env.local

# 5. Start development
npm run dev
```

## 🔐 Environment Variables

### Required Variables (Get from your Firebase/Supabase projects)

```env
# Firebase (get from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id (optional)

# Supabase (get from Supabase Dashboard)
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Google Maps (get from Google Cloud Console)
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### Where to Find These

**Firebase:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Copy the config object values

**Supabase:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the URL and anon key

**Google Maps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Maps API
4. Create an API key

## 📦 Dependency Management

### Node Version Management

**Using nvm (Node Version Manager)**

macOS/Linux:
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 18
nvm install 18

# Use Node 18
nvm use 18
```

Windows:
- Use [nvm-windows](https://github.com/coreybutler/nvm-windows)
- Or use [fnm](https://github.com/Schniz/fnm)

### Package Manager

**Choose one (not multiple):**

```bash
# NPM (included with Node.js)
npm install

# Yarn (recommended for monorepos)
npm install -g yarn
yarn install

# PNPM (fastest)
npm install -g pnpm
pnpm install

# Bun (fastest install & runtime)
npm install -g bun
bun install
```

## ✅ Verify Installation

```bash
# Check Node version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check npm packages
npm list --depth=0

# Run type check
npm run type-check

# Run linter
npm run lint

# Run tests
npm run test
```

## 🐛 Common Issues & Solutions

### Issue: "npm: command not found"
**Solution:**
1. Reinstall Node.js from [nodejs.org](https://nodejs.org)
2. Restart terminal/PowerShell
3. Verify with `node --version`

### Issue: Port 8080 already in use
**Solution:**
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3000
```

### Issue: "Module not found" errors
**Solution:**
- Delete node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Issue: Cannot find .env variables
**Solution:**
1. Ensure `.env.local` exists in project root
2. Restart dev server after changing .env
3. Check variable names start with `VITE_`

### Issue: Sharp build fails
**Solution:**
```bash
# Rebuild Sharp for your platform
npm rebuild sharp

# Or clear and reinstall
npm cache clean --force
npm install
```

### Issue: Permission denied on scripts
**Solution (Linux/macOS):**
```bash
chmod +x scripts/setup.js
chmod +x scripts/prebuild.js
```

## 📱 Mobile Development Setup

### iOS (macOS only)

```bash
# Build web version first
npm run build

# Add iOS platform
npx cap add ios

# Sync capacitor
npx cap sync ios

# Open Xcode
npx cap open ios

# In Xcode: Select your team & Sign in
# Then: Run on simulator or device
```

### Android (All Platforms)

```bash
# Build web version first
npm run build

# Add Android platform
npx cap add android

# Sync capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# In Android Studio: Select device & run
```

## 🚀 Deployment

### Vercel
1. Push code to GitHub
2. Connect project at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy!

### Local Production Build
```bash
npm run build
npm run preview
```

## 📚 Useful Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Capacitor Docs](https://capacitorjs.com/docs)

## 💬 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
2. Check [README.md](./README.md) for project overview
3. Check [MOBILE_APP.md](./MOBILE_APP.md) for mobile setup
4. Check [troubleshooting section](#-common-issues--solutions) above

---

**Happy coding! 🎉**
