const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
    
    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Gemini API Not Configured')
        .setDescription('The Gemini API key is not configured. Please set the `GEMINI_API_KEY` environment variable.')
        .setColor(0xff0000)
        .setTimestamp();
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Defer reply since API call might take time
    await interaction.deferReply();

    try {
      // Make request to Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          { name: 'Question', value: question, inline: false },
          { name: 'Model', value: 'Gemini Pro', inline: true },
          { name: 'Response Length', value: `${answer.length} characters`, inline: true }
        )
        .setColor(0x4285f4)
        .setFooter({ text: 'Powered by Google Gemini AI' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription(`Failed to get response from Gemini AI: ${error.message}`)
        .setColor(0xff0000)
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
}; 