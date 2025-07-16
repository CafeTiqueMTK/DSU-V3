const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Sends a cat image 🐱'),

  async execute(interaction) {
    try {
      const response = await fetch('https://api.thecatapi.com/v1/images/search');
      const data = await response.json();
      if (!data[0] || !data[0].url) {
        await interaction.reply({ content: 'No cat image found.', ephemeral: true });
        return;
      }
      await interaction.reply({ content: 'Here is a cat 🐱', files: [data[0].url] });
    } catch (e) {
      await interaction.reply({ content: 'Failed to fetch cat image.', ephemeral: true });
    }
  }
};
