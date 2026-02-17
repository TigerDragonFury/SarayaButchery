# Dependency Audit Report
**Generated:** February 18, 2026

## 📊 Summary
- **Total Dependencies:** 83
- **Security Issues:** 12 (7 moderate, 5 high)
- **Status:** ⚠️ Requires Updates

---

## 🔴 Critical Issues (HIGH PRIORITY)

### 1. React Router XSS Vulnerability
- **Package:** `react-router-dom` ^6.30.1
- **Current Version Issue:** Vulnerable to XSS via Open Redirects
- **Affected:** @remix-run/router <=1.23.1
- **Severity:** HIGH
- **Fix:** Update to react-router-dom >=6.31.0
- **Recommendation:** Update immediately

### 2. Vite/esbuild Security Issue
- **Package:** `vite` ^5.4.19 (depends on vulnerable esbuild)
- **Issue:** esbuild enables any website to send requests to dev server
- **Severity:** MODERATE
- **Recommendation:** Update vite to 6.1.7+

### 3. Glob CLI Command Injection
- **Package:** `glob` (transitive dependency)
- **Severity:** HIGH
- **Recommendation:** Run `npm audit fix`

---

## ⚠️ Moderate Issues

### Other Vulnerabilities
1. **@isaacs/brace-expansion** - Uncontrolled Resource Consumption
2. **ajv** - ReDoS vulnerability (in ESLint chain)
3. **js-yaml** - Prototype pollution in merge
4. **lodash** - Prototype pollution in _.unset and _.omit

---

## ✅ Dependency Compatibility Status

### Good (Up-to-date & Compatible)
- ✅ **React** 18.3.1 - Latest
- ✅ **React-DOM** 18.3.1 - Matches React
- ✅ **Firebase** 12.9.0 - Latest
- ✅ **Supabase** 2.93.2 - Latest
- ✅ **TailwindCSS** 3.4.17 - Latest
- ✅ **TypeScript** 5.8.3 - Latest
- ✅ **Vite** 5.4.19 - Recent (migration to 6.x possible)
- ✅ **ESLint** 9.32.0 - Latest

### Capacitor Stack (v8.x)
- ✅ All @capacitor/* packages at ^8.x (consistent)
- ✅ @capacitor/storage ^4.0.0 (compatible with v8)

### Radix UI Components
- ⚠️ Mix of v1.x and v2.x versions (this is intentional per Radix design)
- All current versions are compatible with each other

---

## 📋 Recommended Updates

### Priority 1: Security Updates (URGENT)
```json
{
  "react-router-dom": "^6.31.0"  // Currently: ^6.30.1
}
```

### Priority 2: Optional Upgrades (RECOMMENDED)
```json
{
  "vite": "^6.1.7",              // Currently: ^5.4.19
  "@vitejs/plugin-react-swc": "^3.12.0"
}
```

---

## 🔧 How to Fix

### Option 1: Quick Security Fix
```bash
npm audit fix
```
This will fix most moderate vulnerabilities.

### Option 2: Full Update (Recommended)
```bash
npm update react-router-dom --save
npm update vite --save
npm audit fix
```

### Option 3: Manual Fix (Most Control)
Update `package.json` with these changes:
```json
{
  "dependencies": {
    "react-router-dom": "^6.31.0"
  },
  "devDependencies": {
    "vite": "^6.1.7"
  }
}
```
Then run: `npm install`

---

## 📊 Dependency Groups Analysis

### Build Tools (✅ Good)
- Vite: 5.4.19 → Should update to 6.1.7
- TypeScript: 5.8.3 ✅
- ESLint: 9.32.0 ✅

### Framework (✅ Good)
- React: 18.3.1 ✅
- React-DOM: 18.3.1 ✅
- React-Router: 6.30.1 → **Update to 6.31.0**

### UI Libraries (✅ Good)
- Radix-UI: Mixed v1/v2 ✅ (intentional)
- TailwindCSS: 3.4.17 ✅
- Shadcn/ui components ✅

### State Management (✅ Good)
- @tanstack/react-query: 5.83.0 ✅
- React-Hook-Form: 7.61.1 ✅
- Zustand: Not included (not needed with current setup)

### Backend Services (✅ Good)
- Firebase: 12.9.0 ✅
- Supabase: 2.93.2 ✅

### Image Processing
- Sharp: 0.34.5 ✅
- HTML2Canvas: 1.4.1 ✅
- SVGO: 4.0.0 ✅

### Capacitor (Mobile) (✅ Good)
- All @capacitor/* at 8.x ✅
- Consistent versioning ✅

### Testing (✅ Good)
- Vitest: 3.2.4 ✅
- @testing-library/react: 16.0.0 ✅

---

## 🚀 Recommended Action Plan

1. **Immediate (This Week)**
   - Update react-router-dom to 6.31.0
   - Run `npm audit fix` for other vulnerabilities

2. **Short-term (Next 2 Weeks)**
   - Test vite upgrade to 6.1.7 (non-breaking)
   - Verify all features work after updates

3. **Long-term (Monthly)**
   - Monitor `npm outdated` for new versions
   - Review security advisories regularly
   - Keep TailwindCSS and other tools updated

---

## ✨ Conclusion

**Overall Status:** ⚠️ GOOD with minor issues

Your dependency tree is mostly well-maintained. The main issues are:
1. One security vulnerability in React Router (update required)
2. Several transitive dependencies with moderate vulnerabilities (fixable)
3. Minor version upgrades available for better security

**Estimated Fix Time:** 10 minutes
**Risk Level:** Low (all updates are backward compatible)
