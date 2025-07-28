const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Chargement de la configuration
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

// Chargement des commandes
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  }
}

// Déploiement rapide
(async () => {
  try {
    console.log('🚀 Déploiement rapide des commandes...');
    
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: commands,
    });
    
    console.log(`✅ ${commands.length} commandes déployées avec succès !`);
    console.log('💡 Les commandes devraient maintenant apparaître sur Discord.');
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  }
})(); 