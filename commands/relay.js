const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('relay')
    .setDescription('Relay a message to a channel as the bot (reply to the bot message with your content)')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel where the message will be relayed')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: 'Invalid channel.', ephemeral: true });
    }

    // Send a non-ephemeral message in the current channel, asking the user to reply with the content
    const relayPrompt = await interaction.reply({
      content: `Please reply to this message with the content you want the bot to relay in ${channel}.`,
      fetchReply: true
    });

    // Set up a message collector for the reply
    const filter = m => m.reference && m.reference.messageId === relayPrompt.id && m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async userMsg => {
      await channel.send({ content: userMsg.content });
      await userMsg.delete().catch(() => { });
      await relayPrompt.delete().catch(() => {});
      await interaction.followUp({ content: `✅ Message relayed to ${channel}.`, ephemeral: true });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp({ content: 'No reply received. Relay cancelled.', ephemeral: true });
      }
    });
  }
};
