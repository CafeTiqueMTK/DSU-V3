// Script de démarrage optimisé pour Railway
require('dotenv').config();

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DSU V3 Bot...');

// Vérifier les variables d'environnement
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your Railway environment variables.');
  process.exit(1);
}

// Créer le dossier /data s'il n'existe pas
const dataPath = '/data';
if (!fs.existsSync(dataPath)) {
  try {
    fs.mkdirSync(dataPath, { recursive: true });
    console.log('✅ Created /data directory');
  } catch (error) {
    console.error('❌ Failed to create /data directory:', error.message);
    // Continuer même si on ne peut pas créer le dossier
  }
}

// Créer les fichiers de données de base s'ils n'existent pas
const dataFiles = [
  'settings.json',
  'warns.json',
  'coins.json',
  'work.json',
  'tickets.json',
  'reaction_roles.json',
  'reaction_roles_emoji.json',
  'marriage-data.json',
  'funnymsg.json',
  'presets.json',
  'config.json'
];

dataFiles.forEach(file => {
  const filePath = path.join(dataPath, file);
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, '{}');
      console.log(`✅ Created ${file}`);
    } catch (error) {
      console.warn(`⚠️ Could not create ${file}:`, error.message);
    }
  }
});

// Démarrer le bot principal
console.log('🔄 Starting main bot process...');
try {
  require('./index.js');
  console.log('✅ Bot started successfully');
} catch (error) {
  console.error('❌ Failed to start bot:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
