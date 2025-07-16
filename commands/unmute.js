const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('unmute')
    .setDescription('Remove the mute from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unmute')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const member = interaction.options.getMember('user');
    if (!member) {
      await interaction.reply({ content: 'User not found on this server.', ephemeral: true });
      return;
    }

    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'mute');
    if (!muteRole) {
      await interaction.reply({ content: 'No "mute" role found on this server.', ephemeral: true });
      return;
    }

    if (!member.roles.cache.has(muteRole.id)) {
      await interaction.reply({ content: 'This user is not muted.', ephemeral: true });
      return;
    }

    await member.roles.remove(muteRole, `Unmuted by ${interaction.user.tag}`);
    await interaction.reply({ content: `🔊 <@${member.id}> has been unmuted.`, ephemeral: false });
  }
};
