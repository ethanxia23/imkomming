#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Wahoo Data Scraper Environment Setup');
console.log('=====================================\n');

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, path.join(__dirname, '.env.local.backup'));
}

// Get environment variables from user
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  {
    key: 'WAHOO_CLIENT_ID',
    prompt: 'Enter your Wahoo Client ID: ',
    required: true
  },
  {
    key: 'WAHOO_CLIENT_SECRET', 
    prompt: 'Enter your Wahoo Client Secret: ',
    required: true
  },
  {
    key: 'WAHOO_REDIRECT_URI',
    prompt: 'Enter redirect URI (default: http://localhost:3000/api/wahoo_callback): ',
    default: 'http://localhost:3000/api/wahoo_callback'
  },
  {
    key: 'NEXT_PUBLIC_APP_URL',
    prompt: 'Enter app URL (default: http://localhost:3000): ',
    default: 'http://localhost:3000'
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    // All questions answered, create .env.local file
    createEnvFile();
    return;
  }

  const question = questions[index];
  const prompt = question.default ? 
    `${question.prompt}[${question.default}] ` : 
    question.prompt;

  rl.question(prompt, (answer) => {
    const value = answer.trim() || question.default || '';
    
    if (question.required && !value) {
      console.log('❌ This field is required!');
      askQuestion(index);
      return;
    }

    answers[question.key] = value;
    askQuestion(index + 1);
  });
}

function createEnvFile() {
  const envContent = `# Wahoo API Credentials
WAHOO_CLIENT_ID=${answers.WAHOO_CLIENT_ID}
WAHOO_CLIENT_SECRET=${answers.WAHOO_CLIENT_SECRET}
WAHOO_REDIRECT_URI=${answers.WAHOO_REDIRECT_URI}

# Next.js Environment Variables (these are public and safe to expose)
NEXT_PUBLIC_WAHOO_CLIENT_ID=${answers.WAHOO_CLIENT_ID}
NEXT_PUBLIC_APP_URL=${answers.NEXT_PUBLIC_APP_URL}
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local file created successfully!');
    console.log('\n🚀 You can now run: npm run dev');
    console.log('\n📋 Your OAuth flow will work at: http://localhost:3000');
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
  }

  rl.close();
}

// Start the setup process
console.log('This script will help you set up your environment variables for the Wahoo Data Scraper.');
console.log('You can get your Client ID and Secret from your Vercel dashboard or Wahoo developer console.\n');

askQuestion(0);
