# 📱 دليل نشر التطبيق على App Store و Google Play

## المتطلبات الأساسية

### حسابات المطور
- ✅ Apple Developer Account ($99/سنة) - [developer.apple.com](https://developer.apple.com)
- ✅ Google Play Console ($25 مرة واحدة) - [play.google.com/console](https://play.google.com/console)

### أدوات التطوير
- ✅ Mac مع Xcode (للنسخة iOS)
- ✅ Android Studio (للنسخة Android)
- ✅ Node.js v18+
- ✅ Git

---

## 📋 خطوات التجهيز

### 1. استنساخ المشروع من GitHub

```bash
git clone <your-github-repo-url>
cd sarayabutchery-gourmet-uae
npm install
```

### 2. بناء المشروع

```bash
npm run build
```

### 3. إضافة المنصات

```bash
# لـ iOS
npx cap add ios

# لـ Android  
npx cap add android
```

### 4. مزامنة المشروع

```bash
npx cap sync
```

---

## 🍎 نشر على Apple App Store

### إعداد الأيقونات (iOS)

Apple تتطلب أيقونة 1024x1024 بدون شفافية:

1. افتح `public/app-icon-1024.png` (جاهزة في المشروع)
2. استخدم أداة مثل [appicon.co](https://www.appicon.co/) لتوليد جميع الأحجام
3. انسخ المجلد الناتج إلى: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### إعداد Splash Screen (iOS)

1. افتح المشروع في Xcode: `npx cap open ios`
2. اذهب إلى `App > Assets.xcassets > Splash`
3. استبدل الصورة بـ `public/splash-screen.png`

### تعديل Info.plist

أضف الأذونات التالية في `ios/App/App/Info.plist`:

```xml
<!-- الموقع الجغرافي - للتتبع -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>نحتاج موقعك لتتبع طلبك وحساب رسوم التوصيل</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>نحتاج موقعك لتحديث حالة التوصيل</string>

<!-- الكاميرا - لتأكيد التوصيل بالصور -->
<key>NSCameraUsageDescription</key>
<string>نحتاج الكاميرا لالتقاط صور تأكيد التوصيل</string>

<!-- الإشعارات -->
<key>NSUserNotificationsUsageDescription</key>
<string>نحتاج إرسال إشعارات لتحديثات طلبك</string>

<!-- الميكروفون - للملاحظات الصوتية -->
<key>NSMicrophoneUsageDescription</key>
<string>نحتاج الميكروفون لتسجيل ملاحظات صوتية على الطلب</string>
```

### App Store Connect - معلومات التطبيق

#### تطبيق العملاء
| الحقل | القيمة |
|-------|--------|
| App Name | ملحمة السرايا - Al Saraya Butchery |
| Subtitle | أجود اللحوم الحلال في الإمارات |
| Bundle ID | com.alsarayabutchery.app |
| Category | Food & Drink |
| Secondary Category | Shopping |
| Age Rating | 4+ |
| Price | Free |
| Privacy Policy URL | https://alsarayabutcheryllc.com/terms |

#### وصف التطبيق (عربي)
```
ملحمة السرايا - تطبيقك الأول للحوم الحلال الطازجة في الإمارات!

🥩 تصفح واطلب أجود أنواع اللحوم الحلال من لحم بقري ولحم غنم ودجاج طازج
📦 اختر من مجموعتنا المتنوعة من البوكسات العائلية والعروض الخاصة
🚚 توصيل سريع لباب منزلك مع تتبع مباشر لطلبك
📍 تتبع السائق على الخريطة المباشرة لحظة بلحظة
🎙️ أضف ملاحظات صوتية لطلبك لضمان تحضيره حسب رغبتك
📸 تأكيد التوصيل بالصور لضمان جودة طلبك
🔔 إشعارات فورية لكل تحديث على طلبك

ملحمة السرايا - جودة لا تُنسى!
```

#### وصف التطبيق (English)
```
Al Saraya Butchery - Your premium halal meat ordering app in UAE!

🥩 Browse and order the finest halal meat: beef, lamb, and fresh chicken
📦 Choose from our diverse family boxes and special offers
🚚 Fast delivery to your doorstep with live order tracking
📍 Track your driver on the live map in real-time
🎙️ Add voice notes to your order for custom preparation
📸 Photo confirmation of delivery for quality assurance
🔔 Instant notifications for every order update

Al Saraya Butchery - Unforgettable Quality!
```

#### Keywords (100 حرف كحد أقصى)
```
meat,halal,butchery,لحوم,حلال,ملحمة,delivery,توصيل,beef,lamb,chicken,UAE,أبوظبي
```

### Screenshots المطلوبة

أحجام Screenshots المطلوبة:
- **iPhone 6.7"** (1290 x 2796) - iPhone 15 Pro Max
- **iPhone 6.5"** (1284 x 2778) - iPhone 14 Plus  
- **iPhone 5.5"** (1242 x 2208) - iPhone 8 Plus
- **iPad 12.9"** (2048 x 2732) - iPad Pro

📸 **شاشات مقترحة للتصوير:**
1. الصفحة الرئيسية مع العروض
2. صفحة المتجر مع المنتجات
3. تفاصيل منتج مع خيار الملاحظات الصوتية
4. سلة التسوق
5. تتبع الطلب مع الخريطة المباشرة
6. إشعار وصول السائق

### بناء ورفع التطبيق

```bash
# فتح المشروع في Xcode
npx cap open ios

# في Xcode:
# 1. اختر "Any iOS Device" كـ target
# 2. Product > Archive
# 3. بعد الأرشفة: Distribute App > App Store Connect
# 4. Upload
```

### ⚠️ نصائح لتجنب رفض Apple

1. **لا تقل أنه موقع ويب مغلف** - التطبيق يستخدم ميزات أصلية (إشعارات، GPS، كاميرا، هابتيك)
2. **سياسة الخصوصية** - موجودة في `/terms` ✅
3. **وصف دقيق** - لا تبالغ في وصف الميزات
4. **اختبر على جهاز حقيقي** قبل الرفع
5. **حساب تجريبي** - وفّر حساب اختبار لفريق المراجعة
6. **لقطات شاشة حقيقية** - لا تستخدم mockups مضللة

#### معلومات حساب المراجعة (Review Information)
```
Demo Account (Email): test@alsarayabutchery.com
Password: Test123456!
Notes: The app requires location access for delivery tracking.
```

---

## 🤖 نشر على Google Play Store

### إعداد الأيقونات (Android)

1. افتح `public/app-icon-1024.png`
2. في Android Studio: `File > New > Image Asset`
3. اختر `Launcher Icons (Adaptive & Legacy)`
4. استورد الأيقونة واحفظ

### إعداد Splash Screen (Android)

1. انسخ `public/splash-screen.png` إلى:
   - `android/app/src/main/res/drawable/splash.png`
2. أو استخدم Android Studio لإنشاء الأحجام المختلفة

### أذونات Android

تأكد من وجود هذه الأذونات في `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Google Play Console - معلومات التطبيق

| الحقل | القيمة |
|-------|--------|
| App Name | ملحمة السرايا - Al Saraya Butchery |
| Short Description | أجود اللحوم الحلال الطازجة في الإمارات مع توصيل سريع |
| Category | Food & Drink |
| Content Rating | Everyone |
| Price | Free |
| Target Countries | United Arab Emirates |

### بناء APK / AAB

```bash
# فتح المشروع في Android Studio
npx cap open android

# في Android Studio:
# 1. Build > Generate Signed Bundle / APK
# 2. اختر Android App Bundle (.aab)
# 3. أنشئ Keystore جديد (احفظه بمكان آمن!)
# 4. اختر release build variant
# 5. Finish

# أو من Terminal:
cd android
./gradlew bundleRelease
```

### Screenshots المطلوبة (Google Play)

- **Phone**: 1080 x 1920 أو أكبر (2-8 صور)
- **7" Tablet**: 1200 x 1920 (اختياري)
- **10" Tablet**: 1600 x 2560 (اختياري)
- **Feature Graphic**: 1024 x 500 (مطلوب)

---

## 🚛 تطبيق السائقين (منفصل)

> **ملاحظة مهمة:** يُنصح بنشر تطبيق السائقين كتطبيق منفصل

### لإنشاء تطبيق سائقين منفصل:

1. أنشئ مشروع Lovable جديد لتطبيق السائقين
2. استخدم نفس قاعدة البيانات (Supabase)
3. Bundle ID: `com.alsarayabutchery.driver`
4. App Name: `سائق السرايا - Saraya Driver`
5. أيقونة التطبيق: `public/driver-app-icon-1024.png`

### أو نشره من نفس المشروع:

إذا أردت نشر تطبيق واحد يشمل العملاء والسائقين:
- السائقون يدخلون عبر `/driver/login`
- الواجهة تتغير تلقائياً حسب الدور

---

## 🔄 التحديثات المستقبلية

### لكل تحديث جديد:

```bash
# 1. اسحب آخر التغييرات
git pull

# 2. ثبت التبعيات
npm install

# 3. ابنِ المشروع
npm run build

# 4. زامن مع Capacitor
npx cap sync

# 5. افتح وارفع
npx cap open ios    # أو android
```

### للتطوير المباشر (Hot Reload):

التطبيق مُعد للتطوير المباشر عبر:
```
server.url = "https://b58590dc-1309-4244-a272-dee84725ba0d.lovableproject.com?forceHideBadge=true"
```

> **قبل النشر النهائي:** احذف أو علّق خاصية `server.url` في `capacitor.config.ts` ليعمل التطبيق من الملفات المحلية بدلاً من السيرفر.

---

## ✅ قائمة التحقق النهائية

### قبل الرفع:
- [ ] اختبار على جهاز حقيقي (iPhone + Android)
- [ ] التأكد من عمل الإشعارات
- [ ] التأكد من عمل تتبع الموقع
- [ ] التأكد من عمل الكاميرا (تأكيد التوصيل)
- [ ] التأكد من عمل الملاحظات الصوتية
- [ ] التأكد من عمل الهابتيك (الاهتزاز)
- [ ] التأكد من عمل الإنترنت وحالة عدم الاتصال
- [ ] حذف `server.url` من capacitor.config.ts
- [ ] إعداد Firebase Cloud Messaging للإشعارات
- [ ] إعداد أيقونات بجميع الأحجام
- [ ] إعداد Splash Screen
- [ ] كتابة الوصف والكلمات المفتاحية
- [ ] تجهيز لقطات الشاشة
- [ ] إعداد سياسة الخصوصية
- [ ] إنشاء حساب تجريبي لفريق المراجعة

### ميزات أصلية جاهزة في التطبيق:
- ✅ Bottom Navigation أصلي
- ✅ Haptic Feedback
- ✅ Push Notifications (FCM)
- ✅ GPS Tracking
- ✅ Offline Support
- ✅ Safe Area Handling (iPhone notch)
- ✅ Status Bar Customization
- ✅ Back Button Handling (Android)
- ✅ Keyboard Management
- ✅ Network Status Detection
- ✅ Camera Integration (تأكيد التوصيل)
- ✅ Voice Notes (ملاحظات صوتية)
- ✅ RTL Support (Arabic)
- ✅ Dark Mode Support

---

## 📞 الدعم

للمساعدة في النشر أو أي مشاكل تقنية:
- الموقع: [alsarayabutcheryllc.com](https://alsarayabutcheryllc.com)
- هاتف: 023339111
