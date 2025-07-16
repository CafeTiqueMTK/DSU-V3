const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aboutme')
    .setDescription('Displays information about yourself.'),
  
  async execute(interaction) {
    const user = interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const userData = await interaction.client.users.fetch(user.id, { force: true });

    const embed = new EmbedBuilder()
      .setTitle(`🧾 ${user.username}'s Profile`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: 'Username', value: user.username, inline: true },
        { name: 'Full Tag', value: `\`${user.tag}\``, inline: true },
        { name: 'ID', value: `\`${user.id}\``, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` }
      )
      .setColor(0x2ECC71)
      .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

    if (userData.bio) {
      embed.addFields({ name: '📝 Bio', value: userData.bio });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
// Note: This command provides a detailed profile of the user, including their username, tag, ID, account creation date, and bio if available.
// Ensure that the bot has permission to fetch user data and that the user has a bio set up in their Discord profile.