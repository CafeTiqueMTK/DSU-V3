const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Search a Wikipedia article')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('The topic to search on Wikipedia')
        .setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Not found');
      const data = await response.json();
      if (data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
        await interaction.reply({ content: '❌ No result found.', ephemeral: true });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(data.title)
        .setURL(data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`)
        .setDescription(data.extract?.slice(0, 2048) || 'No description.')
        .setColor(0x3399ff);
      if (data.thumbnail?.source) embed.setThumbnail(data.thumbnail.source);
      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (e) {
      await interaction.reply({ content: '❌ Error while searching Wikipedia.', ephemeral: true });
    }
  }
};
