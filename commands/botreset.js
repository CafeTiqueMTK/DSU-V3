const { SlashCommandBuilder, PermissionFlagsBits, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join('/data', 'settings.json');
const warnsPath = path.join('/data', 'warns.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botreset')
    .setDescription('Completely reset the bot configuration (warning: irreversible)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    // Non-ephemeral confirmation request
    await interaction.reply({
      content: '⚠️ This action will **reset ALL bot data**. To confirm, type `YES` in this channel.',
      ephemeral: false
    });

    // Collect user response
    const filter = m => m.author.id === interaction.user.id;
    const channel = interaction.channel;
    try {
      const collected = await channel.awaitMessages({
        filter,
        max: 1,
        time: 30000,
        errors: ['time']
      });
      const response = collected.first();
      if (response.content.trim().toUpperCase() === 'YES') {
        fs.writeFileSync(settingsPath, '{}');
        const automodActionsPath = path.join(__dirname, '../automod_actions.json');
        fs.writeFileSync(automodActionsPath, '{}');
        if (fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, '{}');
        await interaction.followUp({
          content: '♻️ All bot data has been reset.',
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: '❌ Reset cancelled.',
          ephemeral: true
        });
      }
      // Delete the user's confirmation response to keep the channel clean
      await response.delete().catch(() => {});
    } catch {
      await interaction.followUp({
        content: '⏱️ Time expired. Reset cancelled.',
        ephemeral: true
      });
    }
  }
};
