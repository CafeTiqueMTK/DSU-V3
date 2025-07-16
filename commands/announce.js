const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('embed')
    .setDescription('Send a custom embed message to a channel')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Destination channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    // Store channel ID in customId for modal context
    const modal = new ModalBuilder()
      .setCustomId(`embedModal:${channel.id}`)
      .setTitle('Create Custom Embed');

    const titleInput = new TextInputBuilder()
      .setCustomId('embedTitle')
      .setLabel('Embed Title')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const contentInput = new TextInputBuilder()
      .setCustomId('embedContent')
      .setLabel('Embed Content')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const footerInput = new TextInputBuilder()
      .setCustomId('embedFooter')
      .setLabel('Embed Footer (optional)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(contentInput),
      new ActionRowBuilder().addComponents(footerInput)
    );

    await interaction.showModal(modal);
  }
};
