#!/usr/bin/env node

/**
 * Setup script for cross-platform development
 * Works on Windows, macOS, and Linux
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const platform = process.platform;
const isWindows = platform === "win32";

console.log("\n🚀 Saraya Butchery - Cross-Platform Setup");
console.log(`📱 Platform: ${platform.toUpperCase()}`);
console.log("─".repeat(50));

try {
  // Check Node version
  const nodeVersion = process.versions.node;
  console.log(`\n✅ Node.js: ${nodeVersion}`);

  // Check npm version
  const npmVersion = execSync("npm -v", { encoding: "utf8" }).trim();
  console.log(`✅ npm: ${npmVersion}`);

  // Check for .env file
  const envPath = path.join(__dirname, "..", ".env.local");
  const envExamplePath = path.join(__dirname, "..", ".env.example");

  if (!fs.existsSync(envPath)) {
    console.log("\n⚠️  No .env.local file found");
    if (fs.existsSync(envExamplePath)) {
      console.log("   → Copy .env.example to .env.local and fill in your values");
      console.log("\n   On Windows:");
      console.log("     copy .env.example .env.local");
      console.log("\n   On macOS/Linux:");
      console.log("     cp .env.example .env.local");
    }
  } else {
    console.log("✅ .env.local file exists");
  }

  // Check git
  try {
    const gitVersion = execSync("git --version", { encoding: "utf8" }).trim();
    console.log(`\n✅ Git: ${gitVersion}`);
  } catch {
    console.log("\n⚠️  Git not found - install from https://git-scm.com");
  }

  // Platform-specific checks
  console.log("\n📋 Platform-Specific Setup:");

  if (isWindows) {
    console.log("   Windows detected!");
    console.log("   → All scripts should work with npm");
    console.log("   → For mobile builds, you'll need Android Studio");
    console.log("   → For iOS builds, join a macOS machine");
  } else if (platform === "darwin") {
    console.log("   macOS detected!");
    console.log("   → All scripts should work with npm or yarn");
    console.log("   → You can build for both iOS and Android");
    console.log("   → Ensure Xcode is installed: xcode-select --install");
  } else if (platform === "linux") {
    console.log("   Linux detected!");
    console.log("   → Perfect for web and backend development");
    console.log("   → You can build for Android with Android Studio");
    console.log("   → iOS builds require macOS");
  }

  console.log("\n📦 Next Steps:");
  console.log("   1. npm install                 (Install dependencies)");
  console.log("   2. cp .env.example .env.local  (Setup environment)");
  console.log("   3. npm run dev                 (Start dev server)");
  console.log("   4. npm run build               (Build for production)");

  console.log("\n🎯 Development Commands:");
  console.log("   npm run dev        → Start development server");
  console.log("   npm run build      → Build for production");
  console.log("   npm run lint       → Check code quality");
  console.log("   npm run test       → Run tests");
  console.log("   npm run preview    → Preview production build");

  console.log("\n🌐 Deployment Targets:");
  console.log("   ✅ Web (Vite)      → npm run build");
  console.log("   ✅ Vercel          → Auto-deploy on git push");
  console.log("   ✅ iOS (Capacitor) → npx cap add ios");
  console.log("   ✅ Android         → npx cap add android");

  console.log("\n📚 Documentation:");
  console.log("   DEPLOYMENT.md      → Detailed deployment guide");
  console.log("   README.md          → Project overview");
  console.log("   MOBILE_APP.md      → Mobile app setup");

  console.log("\n✨ Setup complete! Happy coding! 🎉\n");
} catch (error) {
  console.error("\n❌ Setup error:", error.message);
  process.exit(1);
}
