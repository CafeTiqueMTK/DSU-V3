const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join('/data', 'settings.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('askgemini')
    .setDescription('Ask a question to Google Gemini AI')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question for Gemini')
        .setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const guildId = interaction.guild.id;
    
    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return interaction.reply({ 
        content: '❌ Gemini API Not Configured\nPlease set the `GEMINI_API_KEY` environment variable.',
        ephemeral: true 
      });
    }

    // Defer reply since API call might take time
    await interaction.deferReply();

    try {
      // Make request to Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': geminiApiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: question
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const answer = data.candidates[0].content.parts[0].text;

      // Create response embed
      const embed = new EmbedBuilder()
        .setTitle('🤖 Gemini AI Response')
        .setDescription(answer.length > 4000 ? answer.substring(0, 4000) + '...' : answer)
        .addFields(
          { name: 'Question', value: question, inline: false }
        )
        .setColor(0x4285f4)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Log the Gemini interaction
      await logGeminiInteraction(interaction, question, answer, true);

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      await interaction.editReply(`❌ Error: Failed to get response from Gemini AI: ${error.message}`);
      
      // Log the failed Gemini interaction
      await logGeminiInteraction(interaction, question, error.message, false);
    }
  }
};

// Function to log Gemini interactions
async function logGeminiInteraction(interaction, question, response, success) {
  try {
    if (!fs.existsSync(settingsPath)) return;
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    
    if (!settings[interaction.guild.id] || !settings[interaction.guild.id].logs) return;
    const logs = settings[interaction.guild.id].logs;
    
    if (!logs.enabled || !logs.channel || !logs.categories.gemini) return;
    
    const logChannel = interaction.guild.channels.cache.get(logs.channel);
    if (!logChannel) return;
    
    const logEmbed = new EmbedBuilder()
      .setTitle('🤖 Gemini AI Interaction')
      .setColor(success ? 0x4285f4 : 0xff5555)
      .addFields(
        { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
        { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true },
        { name: 'Status', value: success ? '✅ Success' : '❌ Error', inline: true },
        { name: 'Question', value: question.length > 1024 ? question.substring(0, 1021) + '...' : question, inline: false },
        { name: 'Response', value: success ? (response.length > 1024 ? response.substring(0, 1021) + '...' : response) : `Error: ${response}`, inline: false }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [logEmbed] });
  } catch (error) {
    console.error('Error logging Gemini interaction:', error);
  }
} 