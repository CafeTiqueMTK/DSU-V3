const { SlashCommandBuilder, PermissionFlagsBits, } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('reloadcommand')
    .setDescription('Dynamically reload all bot commands (admin only)'),

  async execute(interaction) {
    // Load config
    const config = JSON.parse(fs.readFileSync(path.join('/data', 'config.json'), 'utf-8'));
    const commandsPath = path.join(__dirname);
    const client = interaction.client;

    // Reload commands
    client.commands.clear();
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commandsArray = [];
    for (const file of commandFiles) {
      if (file === 'reloadcommand.js') continue; // Do not reload this command itself
      const filePath = path.join(commandsPath, file);
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      client.commands.set(command.data.name, command);
      commandsArray.push(command.data.toJSON());
    }

    // Deploy commands via REST
    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commandsArray }
      );
      await interaction.reply('✅ Commands have been successfully reloaded and redeployed.');
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ An error occurred while reloading the commands.');
    }
  }
};
