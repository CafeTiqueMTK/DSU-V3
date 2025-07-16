const { SlashCommandBuilder } = require('discord.js');
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
      await interaction.reply({ content: 'Here is a dog 🐶', files: [data.message] });
    } catch (e) {
      await interaction.reply({ content: 'Failed to fetch dog image.', ephemeral: true });
    }
  }
};
