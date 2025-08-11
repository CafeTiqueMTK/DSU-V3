// Script de test pour vérifier le démarrage du bot
require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing bot startup...');

// Vérifier les variables d'environnement
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

console.log('📋 Environment variables:');
console.log(`- DISCORD_TOKEN: ${DISCORD_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`- CLIENT_ID: ${CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`- GUILD_ID: ${GUILD_ID ? '✅ Set' : '❌ Missing'}`);

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Créer le client
console.log('🤖 Creating Discord client...');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ]
});

client.commands = new Collection();

// Fonction utilitaire pour charger les commandes
function loadCommands(client, commandsPath) {
  console.log(`📁 Loading commands from: ${commandsPath}`);
  
  if (!fs.existsSync(commandsPath)) {
    console.error(`❌ Commands directory not found: ${commandsPath}`);
    return [];
  }
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  console.log(`📄 Found ${commandFiles.length} command files`);
  
  const commandsArray = [];
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    let command;
    try {
      command = require(filePath);
      console.log(`✅ Loaded command: ${file}`);
    } catch (err) {
      console.warn(`⚠️ Failed to load command file ${file}: ${err.message}`);
      continue;
    }
    
    if (!command || !command.data || !command.data.name) {
      console.warn(`⚠️ Invalid command export in file: ${file}`);
      continue;
    }
    
    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
    console.log(`✅ Registered command: ${command.data.name}`);
  }
  
  return commandsArray;
}

// Charger les commandes
console.log('📦 Loading commands...');
const commandsPath = path.join(__dirname, 'commands');
const commandsArray = loadCommands(client, commandsPath);

console.log(`📊 Total commands loaded: ${commandsArray.length}`);

// Vérifier le fichier de données de mariage
console.log('💒 Checking marriage data file...');
const marriageDataPath = path.join(__dirname, 'marriage-data.json');

if (!fs.existsSync(marriageDataPath)) {
  console.log('📝 Creating marriage data file...');
  const defaultData = {
    marriages: {},
    divorces: {},
    stats: {
      total_marriages: 0,
      total_divorces: 0
    },
    config: {
      announcementChannel: null
    }
  };
  fs.writeFileSync(marriageDataPath, JSON.stringify(defaultData, null, 2));
  console.log('✅ Marriage data file created');
} else {
  console.log('✅ Marriage data file exists');
  try {
    const data = JSON.parse(fs.readFileSync(marriageDataPath, 'utf8'));
    console.log(`📊 Marriage data: ${Object.keys(data.marriages || {}).length} marriages, ${data.stats?.total_marriages || 0} total`);
  } catch (error) {
    console.warn('⚠️ Error reading marriage data file:', error.message);
  }
}

// Test de connexion
console.log('🔗 Testing Discord connection...');

client.once('ready', () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
  console.log(`🏠 Connected to ${client.guilds.cache.size} guilds`);
  
  // Lister les serveurs
  client.guilds.cache.forEach(guild => {
    console.log(`  - ${guild.name} (${guild.id})`);
  });
  
  console.log('🎉 Startup test completed successfully!');
  process.exit(0);
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
  process.exit(1);
});

// Timeout de sécurité
setTimeout(() => {
  console.error('⏰ Connection timeout - bot failed to connect within 30 seconds');
  process.exit(1);
}, 30000);

// Connexion
try {
  client.login(DISCORD_TOKEN);
} catch (error) {
  console.error('❌ Failed to login:', error);
  process.exit(1);
}
