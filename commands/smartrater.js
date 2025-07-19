const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('smartrater')
    .setDescription('Rate how smart a user is (for fun)')
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
      emoji = '🧠🧠🧠';
      color = 0x00ff00;
      message = 'Einstein level! Genius detected! 🧠';
    } else if (percentage >= 80) {
      emoji = '🧠🧠';
      color = 0x44ff44;
      message = 'Very intelligent! Brain power! 💡';
    } else if (percentage >= 70) {
      emoji = '🧠';
      color = 0x66ff66;
      message = 'Pretty smart! 😊';
    } else if (percentage >= 60) {
      emoji = '💡';
      color = 0x88ff88;
      message = 'Above average intelligence! 👍';
    } else if (percentage >= 50) {
      emoji = '😐';
      color = 0xaaffaa;
      message = 'Average intelligence! 🙂';
    } else if (percentage >= 40) {
      emoji = '🤔';
      color = 0xccffcc;
      message = 'Could be smarter... 🤷‍♂️';
    } else if (percentage >= 30) {
      emoji = '😅';
      color = 0xeeffee;
      message = 'Not the brightest... 😅';
    } else if (percentage >= 20) {
      emoji = '😬';
      color = 0xffffcc;
      message = 'Brain.exe has stopped working! 😬';
    } else {
      emoji = '💀';
      color = 0xffffaa;
      message = 'Smooth brain detected! 💀';
    }

    const embed = new EmbedBuilder()
      .setTitle('🧠 Smartrater 3000')
      .setDescription(`**${user.displayName || user.username}** is **${percentage}%** smart! ${emoji}\n\n*${message}*`)
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