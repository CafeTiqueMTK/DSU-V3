const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('dm')
    .setDescription('Send a private message to a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the message to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const message = interaction.options.getString('message');

    try {
      await user.send(message);
      await interaction.reply({ content: `📩 Message sent to ${user.tag}.`, ephemeral: true });
    } catch (error) {
      console.error(`Error sending DM to ${user.tag}:`, error);
      await interaction.reply({ content: `❌ Unable to send a message to ${user.tag}.`, ephemeral: true });
    }
  }
};
// This code defines a Discord bot command that allows users to send direct messages (DMs) to other users.
// The command is structured using the SlashCommandBuilder from the discord.js library.