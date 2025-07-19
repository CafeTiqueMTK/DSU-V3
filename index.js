// Load environment variables
require('dotenv').config();

const { Client, GatewayIntentBits, Collection, Events, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { readFileSync, promises: { readFile } } = require('fs');
const fetch = require('node-fetch'); // Assurez-vous d'avoir installé node-fetch v2 ou v3
const { getGuildSettings, updateGuildSettings } = require('./config');

// Déclare la variable automodActionsPath en haut du fichier
const automodActionsPath = path.join(__dirname, 'automod_actions.json');

// Charger les variables d'environnement
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Créer le client
console.log('Creating Discord client...');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent // <-- Ajoute cet intent pour lire le contenu des messages
  ]
});

client.commands = new Collection();

// Fonction utilitaire pour charger les commandes
function loadCommands(client, commandsPath) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  const commandsArray = [];
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    let command;
    try {
      command = require(filePath);
    } catch (err) {
      console.warn(`[WARN] Failed to load command file ${file}: ${err.message}`);
      continue;
    }
    // Debug log to help identify problematic command files
    if (!command || !command.data || !command.data.name) {
      console.warn(`[DEBUG] Invalid command export in file: ${file}, export:`, command);
      console.warn(`[WARN] Command file ${file} is missing 'data' or 'name'. Skipped.`);
      continue;
    }
    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
    console.log(`Loaded command: ${command.data.name}`);
  }
  return commandsArray;
}

// Charger les commandes
console.log('Loading commands...');
const commandsPath = path.join(__dirname, 'commands');
const commandsArray = loadCommands(client, commandsPath);

// Charger settings.json
console.log('Loading settings.json...');
const settingsPath = path.join(__dirname, 'settings.json');
const settingsRaw = fs.readFileSync(settingsPath, 'utf-8');
const settings = JSON.parse(settingsRaw);

// Déployer les commandes
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function deployCommands() {
  try {
    console.log('Deploying commands to Discord API...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commandsArray,
    });
    console.log('Commands deployed successfully.');
    // Ajout d'un log pour indiquer que la connexion va commencer après le déploiement
    console.log('If you do not see the bot online, check your bot token and permissions.');
  } catch (error) {
    console.error('Error while deploying commands:', error);
  }
}
deployCommands();

// Connexion du bot
client.login(DISCORD_TOKEN);

