const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Sends a random dog image'),

  async execute(interaction) {
    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await response.json();
      if (!data.message) {
        await interaction.reply({ content: 'No dog image found.', ephemeral: true });
        return;
      }
      
      const embed = new EmbedBuilder()
        .setTitle('🐶 Random Dog Image')
        .setDescription('Here is a cute dog for you!')
        .setImage(data.message)
        .setColor(0x00ff99)
        .setFooter({ text: 'Powered by dog.ceo API' })
        .setTimestamp(new Date());
      
      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: 'Failed to fetch dog image.', ephemeral: true });
    }
  }
};
