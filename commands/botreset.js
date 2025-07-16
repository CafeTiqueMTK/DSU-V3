const { SlashCommandBuilder, PermissionFlagsBits, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
        const settingsPath = path.join(__dirname, '../settings.json');
        const automodActionsPath = path.join(__dirname, '../automod_actions.json');
        const warnsPath = path.join(__dirname, '../warns.json');
        fs.writeFileSync(settingsPath, '{}');
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
