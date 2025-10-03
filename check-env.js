#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Configuration');
console.log('=====================================\n');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('📋 Run: npm run setup');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

const requiredVars = [
  'WAHOO_CLIENT_ID',
  'WAHOO_CLIENT_SECRET', 
  'WAHOO_REDIRECT_URI',
  'NEXT_PUBLIC_WAHOO_CLIENT_ID',
  'NEXT_PUBLIC_APP_URL'
];

let allConfigured = true;

console.log('Environment Variables Status:');
console.log('-----------------------------');

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_wahoo_client_id_here' && value !== 'your_wahoo_client_secret_here') {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Not configured`);
    allConfigured = false;
  }
});

console.log('\n' + '='.repeat(30));

if (allConfigured) {
  console.log('✅ All environment variables are configured!');
  console.log('🚀 You can now run: npm run dev');
  console.log('🌐 Open: http://localhost:3000');
} else {
  console.log('❌ Some environment variables are missing or not configured');
  console.log('📋 Run: npm run setup');
}

console.log('\n📖 For production deployment, make sure to set these variables in Vercel:');
requiredVars.forEach(varName => {
  console.log(`   - ${varName}`);
});
