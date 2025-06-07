// Script to properly deploy the AI assistant edge function
const { exec } = require('child_process');
const path = require('path');

console.log('Deploying AI assistant edge function...');

// Change to the supabase directory
process.chdir(path.join(__dirname, 'supabase'));

// Deploy the function with the correct name
exec('supabase functions deploy ai-assistant --no-verify-jwt', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error deploying function: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Deployment stderr: ${stderr}`);
    return;
  }
  
  console.log(`Deployment successful: ${stdout}`);
  console.log('AI assistant function is now available at your Supabase project URL');
});