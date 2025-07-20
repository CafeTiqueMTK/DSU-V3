const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getGuildData, saveGuildData } = require('../utils/guildManager');

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

    // Utiliser le gestionnaire de guild pour obtenir les données
    const warns = getGuildData(guildId, 'warns');

    if (!warns[guildId] || !warns[guildId][user.id]) {
      const noUserWarningsEmbed = new EmbedBuilder()
        .setTitle('❌ No Warnings Found')
        .setDescription(`No warnings found for **${user.tag}**.`)
        .addFields(
          { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true }
        )
        .setColor(0xff0000)
        .setTimestamp();
      return interaction.reply({ embeds: [noUserWarningsEmbed], flags: 64 });
    }

    const warningCount = warns[guildId][user.id].length;
    delete warns[guildId][user.id];

    saveGuildData(guildId, warns, 'warns');

    const clearSuccessEmbed = new EmbedBuilder()
      .setTitle('🧹 Warnings Cleared')
      .setDescription(`All warnings for **${user.tag}** have been successfully deleted.`)
      .addFields(
        { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: '📊 Warnings Removed', value: `${warningCount} warning(s)`, inline: true }
      )
      .setColor(0x00ff00)
      .setTimestamp();
    return interaction.reply({ embeds: [clearSuccessEmbed], flags: 64 });
  }
};
