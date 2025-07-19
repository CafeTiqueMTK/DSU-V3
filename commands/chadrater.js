const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chadrater')
    .setDescription('Rate how much of a chad a user is (for fun)')
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
      emoji = '💪💪💪';
      color = 0x00ff00;
      message = 'GIGACHAD! Absolute unit! 💪';
    } else if (percentage >= 80) {
      emoji = '💪💪';
      color = 0x44ff44;
      message = 'Major chad energy! 🔥';
    } else if (percentage >= 70) {
      emoji = '💪';
      color = 0x66ff66;
      message = 'Pretty chad! 😎';
    } else if (percentage >= 60) {
      emoji = '😎';
      color = 0x88ff88;
      message = 'Has some chad vibes! 👍';
    } else if (percentage >= 50) {
      emoji = '😐';
      color = 0xaaffaa;
      message = 'Average chad level! 🙂';
    } else if (percentage >= 40) {
      emoji = '🤔';
      color = 0xccffcc;
      message = 'Could be more chad... 🤷‍♂️';
    } else if (percentage >= 30) {
      emoji = '😅';
      color = 0xeeffee;
      message = 'Not very chad... 😅';
    } else if (percentage >= 20) {
      emoji = '😬';
      color = 0xffffcc;
      message = 'Virgin energy detected! 😬';
    } else {
      emoji = '🤓';
      color = 0xffffaa;
      message = 'Ultimate virgin! 🤓';
    }

    const embed = new EmbedBuilder()
      .setTitle('💪 Chadrater 3000')
      .setDescription(`**${user.displayName || user.username}** is **${percentage}%** chad! ${emoji}\n\n*${message}*`)
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