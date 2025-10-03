#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📋 Copying environment variables from Vercel...\n');

try {
  // Check if vercel CLI is installed
  execSync('vercel --version', { stdio: 'pipe' });
  
  // Get environment variables from Vercel
  const envVars = execSync('vercel env pull .env.local', { 
    stdio: 'pipe',
    cwd: __dirname 
  }).toString();
  
  console.log('✅ Environment variables copied from Vercel to .env.local');
  console.log('🚀 You can now run: npm run dev');
  
} catch (error) {
  console.log('❌ Vercel CLI not found or not logged in.');
  console.log('📋 Please run one of these options:');
  console.log('   1. Run: node setup-env.js (interactive setup)');
  console.log('   2. Install Vercel CLI: npm i -g vercel');
  console.log('   3. Create .env.local manually with your credentials');
  console.log('\n📖 See SETUP.md for detailed instructions');
}
