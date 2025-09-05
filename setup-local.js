#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Eduvado Admin for Local Development...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
}

console.log('\n📋 Next Steps:');
console.log('1. Make sure the backend is running on http://localhost:5000');
console.log('2. Run: npm install');
console.log('3. Run: npm start');
console.log('4. The admin panel will be available at http://localhost:3000');
console.log('\n🎉 Setup complete!');
