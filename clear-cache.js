#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing all caches...');

// Clear Next.js cache
const nextCacheDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCacheDir)) {
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
  console.log('✅ Cleared .next cache');
}

// Clear node_modules cache
const nodeModulesDir = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesDir)) {
  fs.rmSync(nodeModulesDir, { recursive: true, force: true });
  console.log('✅ Cleared node_modules cache');
}

// Clear package-lock.json
const packageLockFile = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(packageLockFile)) {
  fs.unlinkSync(packageLockFile);
  console.log('✅ Cleared package-lock.json');
}

// Clear yarn.lock
const yarnLockFile = path.join(process.cwd(), 'yarn.lock');
if (fs.existsSync(yarnLockFile)) {
  fs.unlinkSync(yarnLockFile);
  console.log('✅ Cleared yarn.lock');
}

console.log('🎉 All caches cleared! Run "npm install" to reinstall dependencies.');


