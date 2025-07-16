const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Show the weather for your location')
    .addStringOption(opt =>
      opt.setName('city')
        .setDescription('City or location (e.g. Paris, London, New York)')
        .setRequired(true)
    ),
  async execute(interaction) {
    const city = interaction.options.getString('city');
    const apiKey = '9a00d84550d54d1fb19121459250607'; // Remplace par ta clé API WeatherAPI
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&lang=en`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      const current = data.current;
      const location = data.location;
      const embed = new EmbedBuilder()
        .setTitle(`Weather in ${location.name}, ${location.country}`)
        .setDescription(`${current.condition.text}`)
        .addFields(
          { name: '🌡️ Temperature', value: `${current.temp_c}°C`, inline: true },
          { name: '💧 Humidity', value: `${current.humidity}%`, inline: true },
          { name: '💨 Wind', value: `${current.wind_kph} km/h`, inline: true }
        )
        .setThumbnail(`https:${current.condition.icon}`)
        .setColor(0x00bfff)
        .setFooter({ text: 'Powered by WeatherAPI.com' })
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (e) {
      await interaction.reply({ content: '❌ City not found or weather service unavailable.', ephemeral: true });
    }
  }
};
