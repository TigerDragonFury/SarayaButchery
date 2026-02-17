# Deployment Guide

This project is optimized for deployment on **Vercel** and works seamlessly across **all platforms** (Windows, macOS, Linux, and mobile).

## 📋 Prerequisites

- **Node.js 18+** (required)
- **npm 9+** or **yarn 1.22+** or **bun 1.0+**
- **Git** (for version control)

## 🚀 Vercel Deployment

### Quick Start

1. **Push to GitHub** (already done)
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Select your GitHub repository: `TigerDragonFury/SarayaButchery`
   - Vercel will auto-detect the Vite framework

3. **Configure Environment Variables**
   In your Vercel project settings, add these environment variables:
   
   ```
   VITE_FIREBASE_API_KEY=your_value
   VITE_FIREBASE_AUTH_DOMAIN=your_value
   VITE_FIREBASE_PROJECT_ID=your_value
   VITE_FIREBASE_STORAGE_BUCKET=your_value
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
   VITE_FIREBASE_APP_ID=your_value
   VITE_SUPABASE_URL=your_value
   VITE_SUPABASE_ANON_KEY=your_value
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build completion
   - Your app will be live at `https://your-project.vercel.app`

### Auto-Deploy

After initial setup, any push to `main` branch automatically deploys to production.

## 🏗️ Local Development

### Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using bun (fastest)
bun install
```

### Setup Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
# Add your Firebase, Supabase, and Google Maps credentials
```

### Run Development Server

```bash
npm run dev
```

Access at: `http://localhost:8080`

## 🔨 Build for Production

```bash
# Standard build
npm run build

# Build with development mode
npm run build:dev

# Preview production build
npm run preview
```

## 📱 Mobile Deployment (Capacitor)

### Prerequisites

- Xcode (for iOS) - macOS only
- Android Studio (for Android) - Windows, macOS, Linux
- CocoaPods (for iOS) - macOS only

### Build for iOS

```bash
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

### Build for Android

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## 🔍 Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Run tests
npm run test
```

## 📁 Project Structure

```
src/
├── components/      # React components
├── pages/          # Page components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── lib/            # Utility libraries
├── types/          # TypeScript types
└── assets/         # Static assets

dist/               # Production build output
scripts/            # Build scripts
```

## 🌍 Cross-Platform Compatibility

This project is optimized for:

- ✅ **Web**: Vite + React (all browsers)
- ✅ **Vercel**: Serverless deployment
- ✅ **Windows**: Full support
- ✅ **macOS**: Full support
- ✅ **Linux**: Full support
- ✅ **iOS**: Capacitor integration
- ✅ **Android**: Capacitor integration

## ⚙️ Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `vercel.json` - Vercel deployment settings
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- `.vercelignore` - Vercel ignore rules

## 🐛 Troubleshooting

### Build Fails on Vercel

1. **Check Node.js version**
   - Vercel uses Node.js 20 by default
   - Ensure dependencies support Node 18+

2. **Missing Environment Variables**
   - Add all `VITE_*` variables to Vercel project settings
   - Rebuild after adding variables

3. **Build Size Issues**
   - Check `npm run build` output locally
   - Vercel has 45MB limit for preview deployments

### Sharp Module Issues

If you see Sharp-related errors:
```bash
# Rebuild Sharp for your platform
npm rebuild sharp
```

### Port Already in Use

```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3000
```

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Capacitor Documentation](https://capacitorjs.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 📞 Support

For deployment issues:
1. Check Vercel build logs: `Vercel Dashboard → Project → Deployments`
2. Run `npm run build` locally to test
3. Verify all environment variables are set
4. Check for TypeScript errors: `npm run type-check`
