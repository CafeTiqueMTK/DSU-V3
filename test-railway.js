// Script de test pour Railway
console.log('🧪 Testing Railway configuration...');

// Vérifier les variables d'environnement
const requiredVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

console.log('✅ Environment variables OK');

// Vérifier les fichiers essentiels
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'index.js',
  'start-bot.js',
  'package.json',
  'commands'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file/directory missing: ${file}`);
    process.exit(1);
  }
}

console.log('✅ Required files OK');

// Vérifier le dossier commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

if (commandFiles.length === 0) {
  console.error('❌ No command files found in commands directory');
  process.exit(1);
}

console.log(`✅ Found ${commandFiles.length} command files`);

// Tester la création du dossier /data
const dataPath = '/data';
try {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
    console.log('✅ Created /data directory');
  } else {
    console.log('✅ /data directory exists');
  }
} catch (error) {
  console.warn('⚠️ Could not create /data directory:', error.message);
}

console.log('🎉 Railway configuration test passed!');
console.log('Ready for deployment');

