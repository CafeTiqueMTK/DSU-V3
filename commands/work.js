const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work for coins! You can work once every hour.'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const coinsPath = path.join('/data', 'coins.json');
      const workPath = path.join('/data', 'work.json');

      // Load coins data
      let coinsData = {};
      if (fs.existsSync(coinsPath)) {
        coinsData = JSON.parse(fs.readFileSync(coinsPath, 'utf-8'));
      }

      // Load work cooldown data
      let workData = {};
      if (fs.existsSync(workPath)) {
        workData = JSON.parse(fs.readFileSync(workPath, 'utf-8'));
      }

      // Initialize user data if not exists
      if (!coinsData[userId]) {
        coinsData[userId] = { coins: 0 };
      }
      if (!workData[userId]) {
        workData[userId] = { lastWork: 0 };
      }

      // Check cooldown (1 hour = 3600000 milliseconds)
      const now = Date.now();
      const lastWork = workData[userId].lastWork;
      const cooldown = 3600000; // 1 hour in milliseconds
      const timeLeft = cooldown - (now - lastWork);

      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);

        const timeString = hours > 0 
          ? `${hours}h ${minutes}m ${seconds}s`
          : minutes > 0 
            ? `${minutes}m ${seconds}s`
            : `${seconds}s`;

        const cooldownEmbed = new EmbedBuilder()
          .setTitle('⏰ Work Cooldown')
          .setDescription(`You need to rest before working again!\n\n**Time remaining:** ${timeString}`)
          .addFields(
            { name: '💤 Rest Time', value: 'Take a break and come back later!', inline: true },
            { name: '💰 Current Coins', value: `${coinsData[userId].coins} coins`, inline: true }
          )
          .setColor(0xffa500)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
        return;
      }

      // Define work jobs with their rewards and descriptions
      const jobs = [
        {
          name: 'Car Wash',
          emoji: '🚗',
          description: 'You washed cars in the neighborhood',
          minCoins: 60,
          maxCoins: 120,
          messages: [
            'You carefully washed 3 cars and made them shine!',
            'A customer was so impressed they gave you a tip!',
            'You found some loose change in one of the cars!'
          ]
        },
        {
          name: 'Household Chores',
          emoji: '🏠',
          description: 'You did various household tasks',
          minCoins: 50,
          maxCoins: 100,
          messages: [
            'You cleaned the entire house and organized everything!',
            'Your mom was so happy with your work!',
            'You found some money while cleaning under the couch!'
          ]
        },
        {
          name: 'Grocery Delivery',
          emoji: '🛒',
          description: 'You delivered groceries to people',
          minCoins: 70,
          maxCoins: 140,
          messages: [
            'You delivered groceries to 5 different houses!',
            'One customer was very grateful and tipped you well!',
            'You helped an elderly person carry their bags!'
          ]
        },
        {
          name: 'Pet Sitting',
          emoji: '🐕',
          description: 'You took care of pets for neighbors',
          minCoins: 80,
          maxCoins: 160,
          messages: [
            'You walked 3 dogs and fed 2 cats!',
            'The pets loved you and their owners were very happy!',
            'You found a lost dog and returned it to its owner!'
          ]
        },
        {
          name: 'Garden Work',
          emoji: '🌱',
          description: 'You worked in gardens and yards',
          minCoins: 65,
          maxCoins: 130,
          messages: [
            'You mowed lawns and watered plants!',
            'You helped plant beautiful flowers!',
            'The garden looks amazing thanks to your work!'
          ]
        },
        {
          name: 'Tech Support',
          emoji: '💻',
          description: 'You helped people with computer problems',
          minCoins: 90,
          maxCoins: 180,
          messages: [
            'You fixed 2 computers and set up a new printer!',
            'You helped someone recover their important files!',
            'Your tech skills saved the day!'
          ]
        },
        {
          name: 'Tutoring',
          emoji: '📚',
          description: 'You tutored students in various subjects',
          minCoins: 75,
          maxCoins: 150,
          messages: [
            'You helped 3 students with their homework!',
            'One student improved their grades thanks to you!',
            'You explained difficult concepts clearly!'
          ]
        },
        {
          name: 'Event Setup',
          emoji: '🎉',
          description: 'You helped set up events and parties',
          minCoins: 85,
          maxCoins: 170,
          messages: [
            'You set up decorations and arranged tables!',
            'The party was a huge success thanks to your help!',
            'You helped organize a community event!'
          ]
        },
        {
          name: 'Moving Help',
          emoji: '📦',
          description: 'You helped people move houses',
          minCoins: 100,
          maxCoins: 200,
          messages: [
            'You helped carry heavy furniture and boxes!',
            'You made the moving process much easier!',
            'The family was very grateful for your help!'
          ]
        },
        {
          name: 'Food Service',
          emoji: '🍕',
          description: 'You worked in food service',
          minCoins: 55,
          maxCoins: 110,
          messages: [
            'You served customers at a local restaurant!',
            'You helped prepare delicious meals!',
            'Customers loved your friendly service!'
          ]
        }
      ];

      // Select random job
      const selectedJob = jobs[Math.floor(Math.random() * jobs.length)];
      const earnedCoins = Math.floor(Math.random() * (selectedJob.maxCoins - selectedJob.minCoins + 1)) + selectedJob.minCoins;
      const randomMessage = selectedJob.messages[Math.floor(Math.random() * selectedJob.messages.length)];

      // Update coins and work data
      coinsData[userId].coins += earnedCoins;
      workData[userId].lastWork = now;

      // Save data
      fs.writeFileSync(coinsPath, JSON.stringify(coinsData, null, 2));
      fs.writeFileSync(workPath, JSON.stringify(workData, null, 2));

      // Create success embed
      const workEmbed = new EmbedBuilder()
        .setTitle(`💼 Work Complete!`)
        .setDescription(`**${selectedJob.emoji} ${selectedJob.name}**\n\n${randomMessage}\n\n**You earned ${earnedCoins} coins!**`)
        .addFields(
          { name: '💰 Earnings', value: `+${earnedCoins} coins`, inline: true },
          { name: '💳 New Balance', value: `${coinsData[userId].coins} coins`, inline: true },
          { name: '⏰ Next Work', value: 'Available in 1 hour', inline: true }
        )
        .setColor(0x00ff99)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Come back in 1 hour for more work! • Requested by ${interaction.user.tag}`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      // Add streak bonus if applicable
      const streak = workData[userId].streak || 0;
      const newStreak = streak + 1;
      workData[userId].streak = newStreak;

      if (newStreak >= 3) {
        const streakBonus = Math.floor(earnedCoins * 0.1); // 10% bonus for 3+ day streak
        coinsData[userId].coins += streakBonus;
        fs.writeFileSync(coinsPath, JSON.stringify(coinsData, null, 2));

        workEmbed.addFields({
          name: '🔥 Streak Bonus!',
          value: `You've worked ${newStreak} days in a row!\n+${streakBonus} bonus coins`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [workEmbed] });

    } catch (error) {
      console.error('Error in work command:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Work Error')
        .setDescription('An error occurred while processing your work request.')
        .addFields(
          { name: '🔧 Issue', value: 'Please try again later or contact support if the problem persists.', inline: false }
        )
        .setColor(0xff0000)
        .setTimestamp();
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
}; 