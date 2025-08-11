// Script de démarrage simplifié pour le bot
require('dotenv').config();

const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Discord bot...');

// Vérifier les variables d'environnement
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Créer le client
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
  if (!fs.existsSync(commandsPath)) {
    console.error(`❌ Commands directory not found: ${commandsPath}`);
    return [];
  }
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  const commandsArray = [];
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    let command;
    try {
      command = require(filePath);
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
    console.log(`✅ Loaded command: ${command.data.name}`);
  }
  
  return commandsArray;
}

// Charger les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandsArray = loadCommands(client, commandsPath);

console.log(`📊 Total commands loaded: ${commandsArray.length}`);

// Vérifier le fichier de données de mariage
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
}

// Déployer les commandes
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function deployCommands() {
  try {
    console.log('📤 Deploying commands to Discord API...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commandsArray,
    });
    console.log('✅ Commands deployed successfully.');
  } catch (error) {
    console.error('❌ Error while deploying commands:', error);
  }
}

// Gestionnaire d'événements pour les interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing command ${interaction.commandName}:`, error);
    
    const errorMessage = '❌ There was an error while executing this command!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

// Événement ready
client.once('ready', () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
  console.log(`🏠 Connected to ${client.guilds.cache.size} guilds`);
  
  // Déployer les commandes après la connexion
  deployCommands();
});

// Gestion des erreurs
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Connexion
try {
  client.login(DISCORD_TOKEN);
} catch (error) {
  console.error('❌ Failed to login:', error);
  process.exit(1);
}
