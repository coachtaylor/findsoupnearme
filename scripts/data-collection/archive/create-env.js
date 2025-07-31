// Script to create a properly formatted .env file
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if .env and .env.local exist
const envExists = fs.existsSync('.env');
const envLocalExists = fs.existsSync('.env.local');

console.log('This script will create a new .env file with your Google Maps API key.');

if (envExists) {
  console.log('⚠️ A .env file already exists.');
  rl.question('Do you want to back it up before creating a new one? (y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      const backup = `.env.backup-${Date.now()}`;
      fs.copyFileSync('.env', backup);
      console.log(`✅ Existing .env file backed up to ${backup}`);
      createNewEnvFile();
    } else {
      createNewEnvFile();
    }
  });
} else {
  if (envLocalExists) {
    console.log('ℹ️ Found .env.local file. Will copy relevant variables from it.');
    const envLocalContent = fs.readFileSync('.env.local', 'utf8');
    const supabaseUrl = envLocalContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n]*)/);
    const supabaseKey = envLocalContent.match(/SUPABASE_SERVICE_KEY=([^\n]*)/);
    const supabaseAnonKey = envLocalContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\n]*)/);
    
    let envContent = '';
    if (supabaseUrl && supabaseUrl[1]) {
      envContent += `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl[1]}\n`;
    }
    if (supabaseKey && supabaseKey[1]) {
      envContent += `SUPABASE_SERVICE_KEY=${supabaseKey[1]}\n`;
    } else if (supabaseAnonKey && supabaseAnonKey[1]) {
      envContent += `SUPABASE_SERVICE_KEY=${supabaseAnonKey[1]}\n`;
    }
    
    // Now ask for Google Maps API Key
    rl.question('Please enter your Google Maps API Key: ', (apiKey) => {
      envContent += `GOOGLE_MAPS_API_KEY=${apiKey}\n`;
      
      // Add Claude API Key (optional)
      rl.question('Do you have a Claude API Key? (y/n) ', (hasClaudeKey) => {
        if (hasClaudeKey.toLowerCase() === 'y') {
          rl.question('Please enter your Claude API Key: ', (claudeKey) => {
            envContent += `CLAUDE_API_KEY=${claudeKey}\n`;
            writeEnvFile(envContent);
          });
        } else {
          writeEnvFile(envContent);
        }
      });
    });
  } else {
    createNewEnvFile();
  }
}

function createNewEnvFile() {
  rl.question('Please enter your Google Maps API Key: ', (apiKey) => {
    let envContent = `GOOGLE_MAPS_API_KEY=${apiKey}\n`;
    
    // Ask for Supabase URL
    rl.question('Please enter your Supabase URL: ', (supabaseUrl) => {
      envContent += `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}\n`;
      
      // Ask for Supabase Service Key
      rl.question('Please enter your Supabase Service Key: ', (supabaseKey) => {
        envContent += `SUPABASE_SERVICE_KEY=${supabaseKey}\n`;
        
        // Add Claude API Key (optional)
        rl.question('Do you have a Claude API Key? (y/n) ', (hasClaudeKey) => {
          if (hasClaudeKey.toLowerCase() === 'y') {
            rl.question('Please enter your Claude API Key: ', (claudeKey) => {
              envContent += `CLAUDE_API_KEY=${claudeKey}\n`;
              writeEnvFile(envContent);
            });
          } else {
            writeEnvFile(envContent);
          }
        });
      });
    });
  });
}

function writeEnvFile(content) {
  fs.writeFileSync('.env', content);
  console.log('✅ New .env file created successfully!');
  console.log('\nContent (with masked values):');
  
  // Print masked content
  content.split('\n').forEach(line => {
    if (line.trim() !== '') {
      const parts = line.split('=');
      if (parts.length === 2) {
        const key = parts[0];
        const value = parts[1];
        const maskedValue = value.length > 8 
          ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
          : '[masked]';
        console.log(`${key}=${maskedValue}`);
      }
    }
  });
  
  console.log('\nYou can now run the test script again:');
  console.log('node scripts/data-collection/test-google-api.js');
  
  rl.close();
}