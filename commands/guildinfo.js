const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guildinfo')
    .setDescription('Display information about the server'),

  async execute(interaction) {
    try {
      const guild = interaction.guild;
      
      // Fetch guild to get updated information
      await guild.fetch();
      
      // Get member count
      const memberCount = guild.memberCount;
      
      // Get channel counts
      const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size; // Text channels
      const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size; // Voice channels
      const categories = guild.channels.cache.filter(channel => channel.type === 4).size; // Categories
      const totalChannels = textChannels + voiceChannels + categories;
      
      // Get role count
      const roleCount = guild.roles.cache.size;
      
      // Get boost information
      const boostLevel = guild.premiumTier;
      const boostCount = guild.premiumSubscriptionCount;
      
      // Get owner
      const owner = await guild.fetchOwner();
      
      // Get creation date
      const createdAt = Math.floor(guild.createdTimestamp / 1000);
      
      // Get verification level
      const verificationLevel = guild.verificationLevel;
      const verificationLevels = {
        0: 'None',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Very High'
      };
      
      // Get explicit content filter
      const explicitContentFilter = guild.explicitContentFilter;
      const contentFilters = {
        0: 'Disabled',
        1: 'Members without roles',
        2: 'All members'
      };
      
      // Get features
      const features = guild.features.map(feature => 
        feature.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      );
      
      // Get bots
      const bots = guild.members.cache.filter(member => member.user.bot);
      const botList = bots.map(bot => bot.user.tag).sort();
      
      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`🏛️ ${guild.name} Server Information`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
        .setColor(0x00ff99)
        .setAuthor({ 
          name: guild.name, 
          iconURL: guild.iconURL({ dynamic: true, size: 64 }) 
        })
        .addFields(
          { 
            name: '📊 General Information', 
            value: `**Owner:** ${owner.user.tag}\n**Created:** <t:${createdAt}:F>\n**Server ID:** ${guild.id}`, 
            inline: false 
          },
          { 
            name: '👥 Members', 
            value: `**Total:** ${memberCount.toLocaleString()}`, 
            inline: true 
          },
          { 
            name: '📺 Channels', 
            value: `**Total:** ${totalChannels}\n**Text:** ${textChannels} | **Voice:** ${voiceChannels} | **Categories:** ${categories}`, 
            inline: true 
          },
          { 
            name: '🎭 Roles', 
            value: `**Total:** ${roleCount}`, 
            inline: true 
          },
          { 
            name: '🚀 Boost Status', 
            value: `**Level:** ${boostLevel}/3\n**Boosts:** ${boostCount}`, 
            inline: true 
          },
          { 
            name: '🔒 Security', 
            value: `**Verification:** ${verificationLevels[verificationLevel]}\n**Content Filter:** ${contentFilters[explicitContentFilter]}`, 
            inline: true 
          },
          { 
            name: '🤖 Bots', 
            value: `**Total:** ${bots.size}\n**Online:** ${bots.filter(bot => bot.presence?.status !== 'offline').size}`, 
            inline: true 
          }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      // Add features if any
      if (features.length > 0) {
        embed.addFields({
          name: '✨ Server Features',
          value: features.slice(0, 10).join(', ') + (features.length > 10 ? ` and ${features.length - 10} more...` : ''),
          inline: false
        });
      }

      // Add bot list if any
      if (botList.length > 0) {
        const botDisplay = botList.length <= 15 
          ? botList.join('\n') 
          : botList.slice(0, 15).join('\n') + `\n... and ${botList.length - 15} more bots`;
        
        embed.addFields({
          name: `🤖 Bot List (${botList.length})`,
          value: botDisplay,
          inline: false
        });
      }

      // Add server banner if available
      if (guild.banner) {
        embed.setImage(guild.bannerURL({ size: 1024 }));
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in guildinfo command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while fetching server information.', 
        ephemeral: true 
      });
    }
  },
}; 