const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('clearwarn')
    .setDescription('Delete all warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User whose warnings you want to delete')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const guildId = interaction.guild.id;
    const warnsPath = path.join(__dirname, '../warns.json');

    if (!fs.existsSync(warnsPath)) {
      return interaction.reply({ content: '❌ No warnings found.', ephemeral: true });
    }

    let warns = JSON.parse(fs.readFileSync(warnsPath, 'utf-8'));

    if (!warns[guildId] || !warns[guildId][user.id]) {
      return interaction.reply({ content: `❌ No warnings found for ${user.tag}.`, ephemeral: true });
    }

    delete warns[guildId][user.id];

    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));

    return interaction.reply({ content: `✅ All warnings for ${user.tag} have been deleted.`, ephemeral: true });
  }
};
