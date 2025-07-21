const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join('/data', 'settings.json');

function logModerationAction(guild, userTag, action, reason, moderator) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  const conf = settings[guild.id]?.logs;

  if (conf?.enabled && conf.categories?.mod && conf.channel) {
    const logChannel = guild.channels.cache.get(conf.channel);
    if (logChannel) {
      logChannel.send({
        embeds: [{
          title: `✅ Moderation Action: ${action}`,
          fields: [
            { name: 'User', value: userTag, inline: true },
            { name: 'Moderator', value: `${moderator.tag}`, inline: true },
            { name: 'Reason', value: reason || 'Not specified' }
          ],
          color: 0x00ff00,
          timestamp: new Date()
        }]
      });
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('unban')
    .setDescription('Unban a user by their ID')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription("The ID of the user to unban")
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unbanning')
        .setRequired(false)),
  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const user = await interaction.guild.bans.fetch(userId);
      if (!user) {
        return interaction.reply({ content: "This user is not banned.", ephemeral: true });
      }

      await interaction.guild.members.unban(userId, reason);
      await interaction.reply({ content: `✅ User \`${user.user.tag}\` has been unbanned.`, ephemeral: false });

      logModerationAction(interaction.guild, user.user.tag, 'Unban', reason, interaction.user);

    } catch (error) {
      console.error('Error while unbanning:', error);
      interaction.reply({ content: "❌ An error occurred while unbanning.", ephemeral: true });
    }
  }
};
