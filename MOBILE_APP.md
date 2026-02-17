# Capacitor Native App Setup

This project is configured as a **three-app ecosystem** for iOS and Android using Capacitor.

## Architecture

```
Backend (Supabase + iiko/Syrve)
│
├── Customer App (iOS / Android)
│   └── /shop, /cart, /track, /account
│
├── Driver App (iOS / Android)
│   └── /driver, /driver/map, /driver/notifications
│
└── Admin Web Panel
    └── /admin/delivery, /admin/orders, /admin/drivers
```

## Prerequisites

- **iOS**: Mac with Xcode installed
- **Android**: Android Studio installed
- Node.js and npm

## Quick Start

1. **Clone/Export the project to your local machine**
   ```bash
   git pull origin main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add native platforms**
   ```bash
   npx cap add ios
   npx cap add android
   ```

4. **Build the web app**
   ```bash
   npm run build
   ```

5. **Sync to native platforms**
   ```bash
   npx cap sync
   ```

6. **Run on device/emulator**
   ```bash
   # iOS (requires Mac with Xcode)
   npx cap run ios
   
   # Android
   npx cap run android
   ```

## Hot Reload Development

The app is configured to connect to the Lovable preview URL during development. Changes made in Lovable will automatically reflect in the native app.

To switch to local development:
1. Edit `capacitor.config.ts`
2. Change the `server.url` to your local dev server URL

## Firebase Push Notifications Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Add iOS and Android apps to your Firebase project
3. Download configuration files:
   - iOS: `GoogleService-Info.plist` → place in `ios/App/App/`
   - Android: `google-services.json` → place in `android/app/`
4. Add `FCM_SERVER_KEY` secret in Lovable Cloud

## App Store Submission

### iOS
1. Open `ios/App/App.xcworkspace` in Xcode
2. Configure signing & capabilities
3. Set bundle identifier and version
4. Archive and upload to App Store Connect

### Android
1. Open `android/` folder in Android Studio
2. Configure signing keystore
3. Generate signed APK/AAB
4. Upload to Google Play Console

## Customer App Features

- ✅ Bottom navigation (Home, Shop, Orders, Cart, Account)
- ✅ Push notifications (Firebase FCM)
- ✅ Offline detection banner
- ✅ Safe area handling (iOS notch, home indicator)
- ✅ Haptic feedback
- ✅ Phone + OTP authentication
- ✅ Voice notes recording
- ✅ Live driver tracking on map
- ✅ Smart reorder (favorite items)
- ✅ Arabic/English bilingual support
- ✅ RTL layout support

## Driver App Features

- ✅ Mobile-first interface with large touch targets
- ✅ Bottom navigation (Orders, Map, Alerts, Profile)
- ✅ Blue-themed header (differentiates from customer app)
- ✅ Swipe-to-expand order cards
- ✅ One-tap actions (Start Delivery, Mark Delivered)
- ✅ GPS tracking with real-time location sharing
- ✅ Direct call/WhatsApp customer buttons
- ✅ Open in Maps navigation
- ✅ Offline sync queue
- ✅ Push notifications for new orders

## Admin Web Panel Features

- ✅ Desktop sidebar navigation
- ✅ Mobile bottom navigation
- ✅ Order management with status updates
- ✅ Driver assignment
- ✅ Live tracking map
- ✅ Voice note playback
- ✅ Analytics dashboard
- ✅ Role-based access control

## App Icon & Splash Screen

Generated assets are in:
- `public/app-icon.png` - 1024x1024 app icon

Use tools like:
- https://appicon.co/ - Generate all iOS/Android icon sizes
- https://capacitor-assets.ionic.io/ - Generate splash screens

## Routes Reference

### Customer App
| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/shop` | Product catalog |
| `/cart` | Shopping cart |
| `/checkout` | Order checkout |
| `/track` | Order tracking |
| `/account` | User profile & auth |

### Driver App
| Route | Description |
|-------|-------------|
| `/driver` | Active orders list |
| `/driver/map` | Live delivery map |
| `/driver/notifications` | Push alerts |
| `/driver/profile` | Driver settings |

### Admin Panel
| Route | Description |
|-------|-------------|
| `/admin/delivery` | Dashboard overview |
| `/admin/orders` | Order management |
| `/admin/drivers` | Driver management |
| `/admin/map` | Live tracking map |
| `/admin/analytics` | Statistics |
| `/admin/butcher` | Butcher panel |
| `/admin/iiko-test` | iiko integration test |
