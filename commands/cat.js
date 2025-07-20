const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
        const noCatEmbed = new EmbedBuilder()
          .setTitle('❌ No Cat Found')
          .setDescription('Sorry, no cat image could be found at the moment.')
          .setColor(0xff0000)
          .setTimestamp();
        await interaction.reply({ embeds: [noCatEmbed], ephemeral: true });
        return;
      }
      
      const catEmbed = new EmbedBuilder()
        .setTitle('🐱 Random Cat')
        .setDescription('Here is a cute cat for you!')
        .setImage(data[0].url)
        .setColor(0xffa500)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      
      await interaction.reply({ embeds: [catEmbed] });
    } catch (e) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription('Failed to fetch cat image. Please try again later.')
        .setColor(0xff0000)
        .setTimestamp();
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
