const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hotrater')
    .setDescription('Rate how hot/attractive a user is (for fun)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to rate')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const percentage = Math.floor(Math.random() * 101); // 0 to 100

    // Get emoji based on percentage
    let emoji, color, message;
    
    if (percentage >= 90) {
      emoji = '🔥🔥🔥';
      color = 0xff4444;
      message = 'Absolutely stunning! 🔥';
    } else if (percentage >= 80) {
      emoji = '🔥🔥';
      color = 0xff6666;
      message = 'Very attractive! 😍';
    } else if (percentage >= 70) {
      emoji = '🔥';
      color = 0xff8888;
      message = 'Pretty hot! 😊';
    } else if (percentage >= 60) {
      emoji = '😊';
      color = 0xffaaaa;
      message = 'Looking good! 👍';
    } else if (percentage >= 50) {
      emoji = '😐';
      color = 0xffcccc;
      message = 'Not bad! 🙂';
    } else if (percentage >= 40) {
      emoji = '🤔';
      color = 0xffeeee;
      message = 'Could be better... 🤷‍♂️';
    } else if (percentage >= 30) {
      emoji = '😅';
      color = 0xffdddd;
      message = 'Well... 😅';
    } else if (percentage >= 20) {
      emoji = '😬';
      color = 0xffcccc;
      message = 'Ouch... 😬';
    } else {
      emoji = '💀';
      color = 0xffaaaa;
      message = 'RIP... 💀';
    }

    const embed = new EmbedBuilder()
      .setTitle('🔥 Hotrater 3000')
      .setDescription(`**${user.displayName || user.username}** is **${percentage}%** hot! ${emoji}\n\n*${message}*`)
      .setColor(color)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

// Note: This command is meant for fun and should not be taken seriously. Always be respectful and considerate of others' feelings.
// Make sure to inform users that this command is just for entertainment purposes and not to be taken seriously. 