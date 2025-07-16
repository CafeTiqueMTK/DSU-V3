const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gayrater')
    .setDescription('Rate how gay a user is (for fun)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to rate')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const percentage = Math.floor(Math.random() * 101); // 0 to 100

    const embed = new EmbedBuilder()
      .setTitle('🌈 Gayrater 3000')
      .setDescription(`**${user.displayName || user.username}** is **${percentage}%** gay! 😄`)
      .setColor(0xff69b4)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Just for fun ❤️' });

    await interaction.reply({ embeds: [embed] });
  }
};
// Note: This command is meant for fun and should not be taken seriously. Always be respectful and considerate of others' feelings.
// Make sure to inform users that this command is just for entertainment purposes and not to be taken seriously.