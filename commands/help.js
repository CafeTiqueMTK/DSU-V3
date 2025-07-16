const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('help')
    .setDescription('Displays the list of bot commands')
    .addSubcommand(sub =>
      sub.setName('admin')
        .setDescription('Commands for administrators')
    )
    .addSubcommand(sub =>
      sub.setName('moderator')
        .setDescription('Moderation commands')
    )
    .addSubcommand(sub =>
      sub.setName('user')
        .setDescription('Commands for members')
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // --- ADMIN ---
    if (sub === 'admin') {
      // Page 1
      const embed1 = new EmbedBuilder()
        .setTitle('Admin Commands (1/2)')
        .setDescription(
          `• **/automod enable**: Enable automod\n` +
          `• **/automod disable**: Disable automod\n` +
          `• **/automod status**: Automod status\n` +
          `• **/anti**: Enable/disable an automod category\n` +
          `• **/automod setchannel**: Set automod action channel\n` +
          `• **/automod reset**: Reset automod configuration`
        )
        .setColor(0xff0000)
        .setFooter({ text: 'Page 1/2 - Use the buttons to navigate' });

      // Page 2
      const embed2 = new EmbedBuilder()
        .setTitle('Admin Commands (2/2)')
        .setDescription(
          `• **/setmoderatorrole**: Set moderator role (/mod)\n` +
          `• **/botreset**: Reset all bot data\n` +
          `• **/warnaction**: Automatic action based on warn count\n` +
          `• **/level setchannel**: Set level announcement channel\n` +
          `• **/level setrolebooster**: Set XP booster role\n` +
          `• **/level enable/disable/status/reset/messagetest**\n` +
          `• **/welcome enable/disable/status/setchannel/test**\n` +
          `• **/farewell enable/disable/status/setchannel/test**\n` +
          `• **/autoannounce account add/remove**\n` +
          `• **/autoannounce setchannel/enable/disable/status/test**\n` +
          `• **/license**\n` +
          `• **/help**`
        )
        .setColor(0xff0000)
        .setFooter({ text: 'Page 2/2 - Use the buttons to navigate' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help_admin_prev')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('help_admin_next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Secondary)
        );

      const msg = await interaction.reply({ embeds: [embed1], components: [row], ephemeral: true, fetchReply: true });

      const collector = msg.createMessageComponentCollector({ time: 60000 });
      let page = 1;
      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) return i.reply({ content: 'This menu is not for you.', ephemeral: true });
        if (i.customId === 'help_admin_next') {
          page = 2;
          await i.update({
            embeds: [embed2],
            components: [new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('help_admin_prev')
                  .setLabel('⬅️')
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId('help_admin_next')
                  .setLabel('➡️')
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true)
              )]
          });
        } else if (i.customId === 'help_admin_prev') {
          page = 1;
          await i.update({
            embeds: [embed1],
            components: [row]
          });
        }
      });
      return;
    }

    // --- MODERATOR ---
    if (sub === 'moderator') {
      await interaction.reply({
        embeds: [{
          title: 'Moderator Commands',
          description:
            `• /mod ban — Ban a user\n` +
            `• /mod kick — Kick a user\n` +
            `• /mod warn — Warn a user\n` +
            `• /mod mute — Mute a user (with duration)\n` +
            `• /unban — Unban a user\n` +
            `• /unmute — Unmute a user\n` +
            `• /viewwarn — View a user\'s warns\n`,
          color: 0xffa500
        }],
        ephemeral: true
      });
      return;
    }

    // --- USER ---
    if (sub === 'user') {
      await interaction.reply({
        embeds: [{
          title: 'User Commands',
          description:
            `• /help — Show this help\n` +
            `• /license — Show the bot license\n` +
            `• /dog — Random dog image\n` +
            `• /cat — Random cat image\n` +
            `• /ping — Bot latency\n` +
            `• /about — About the bot\n` +
            `• /aboutme — About you\n` +
            `• /gayrater — Fun gay rate\n` +
            `• /status — Bot status\n`,
          color: 0x00bfff
        }],
        ephemeral: true
      });
      return;
    }
  }
};
