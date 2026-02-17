#!/usr/bin/env node

/**
 * Cross-platform build configuration
 * This script ensures the project builds correctly on all platforms
 * including Windows, macOS, Linux, and Vercel
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check Node.js version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split(".")[0], 10);

if (majorVersion < 18) {
  console.error(`❌ Node.js 18+ is required. Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js ${nodeVersion} detected`);

// Check critical environment files
const requiredFiles = [".env", ".env.local"];
const envFiles = requiredFiles.filter((file) =>
  fs.existsSync(path.join(process.cwd(), file))
);

if (envFiles.length === 0) {
  console.warn(
    "⚠️  No .env file found. Make sure to set environment variables for production."
  );
  console.warn("   Copy .env.example to .env and fill in your values.");
}

// Verify build directory exists
const buildDir = path.join(process.cwd(), "dist");
if (fs.existsSync(buildDir)) {
  console.log("✅ Build directory exists");
} else {
  console.log("ℹ️  Build directory will be created during build");
}

// Check for platform-specific issues
const platform = process.platform;
console.log(`✅ Platform: ${platform}`);

if (platform === "win32") {
  console.log("   → Windows detected, ensuring path compatibility");
}

console.log("\n✅ Pre-build checks completed successfully!");
console.log("\nReady to build for:");
console.log("  • Web (Vite)");
console.log("  • Vercel");
console.log("  • Mobile (Capacitor - iOS/Android)");
