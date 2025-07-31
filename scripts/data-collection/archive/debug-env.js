// Debug script for environment variables
import dotenv from 'dotenv';
import fs from 'fs';

// Load the .env file
dotenv.config();

console.log('==== ENV DEBUGGING ====');

// Check if the .env file exists
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
  
  // Read the raw content of the .env file
  const envContent = fs.readFileSync('.env', 'utf8');
  
  // Check for common formatting issues
  if (envContent.includes('GOOGLE_MAPS_API_KEY=')) {
    console.log('✅ GOOGLE_MAPS_API_KEY is present in .env file');
    
    // Check if the format looks correct (has a value after the equals sign)
    const keyMatch = envContent.match(/GOOGLE_MAPS_API_KEY=([^\n]*)/);
    if (keyMatch && keyMatch[1].trim() !== '') {
      console.log('✅ GOOGLE_MAPS_API_KEY appears to have a value');
      
      // Check for hidden characters or quotes
      const value = keyMatch[1].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        console.log('⚠️ GOOGLE_MAPS_API_KEY has quotes around it, which might cause issues');
      }
      
      if (value.includes(' ')) {
        console.log('⚠️ GOOGLE_MAPS_API_KEY contains spaces, which might cause issues');
      }
    } else {
      console.log('❌ GOOGLE_MAPS_API_KEY is in .env file but has no value');
    }
  } else {
    console.log('❌ GOOGLE_MAPS_API_KEY is NOT found in .env file');
  }
  
  // Print all environment variables that are successfully loaded (without showing actual values)
  console.log('\nLoaded Environment Variables:');
  Object.keys(process.env).forEach(key => {
    if (key.includes('GOOGLE') || key.includes('API') || key.includes('NEXT_PUBLIC') || key.includes('SUPABASE')) {
      // Mask the value for security
      const value = process.env[key];
      const maskedValue = value ? '✓ [value set]' : '✗ [empty]';
      console.log(`${key}: ${maskedValue}`);
    }
  });
} else {
  console.log('❌ .env file does NOT exist in the current directory');
  
  // Check for .env.local
  if (fs.existsSync('.env.local')) {
    console.log('ℹ️ .env.local file exists instead');
  }
}

// Check actual value in process.env
console.log('\nDirect check of process.env:');
if (process.env.GOOGLE_MAPS_API_KEY) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  console.log(`GOOGLE_MAPS_API_KEY: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);
} else {
  console.log('GOOGLE_MAPS_API_KEY: undefined');
}

console.log('\n==== END OF DEBUGGING ====');