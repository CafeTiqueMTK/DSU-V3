const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gifmeme')
    .setDescription('Get a random GIF meme from Reddit'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      // List of popular GIF meme subreddits
      const subreddits = [
        'gifs',
        'reactiongifs',
        'gif',
        'funny',
        'memes',
        'dankmemes',
        'me_irl',
        'teenagers',
        'shitposting',
        'okbuddyretard'
      ];

      // Pick a random subreddit
      const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

      // Fetch GIF meme from Reddit API
      const response = await fetch(`https://www.reddit.com/r/${randomSubreddit}/hot.json?limit=100`);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      const posts = data.data.children.filter(post => {
        // Filter for GIF posts only
        const url = post.data.url;
        return url && (
          url.includes('.gif') ||
          url.includes('gfycat.com') ||
          url.includes('redgifs.com') ||
          url.includes('imgur.com') && url.includes('.gif') ||
          url.includes('i.redd.it') && url.includes('.gif')
        );
      });

      if (posts.length === 0) {
        throw new Error('No GIF memes found');
      }

      // Pick a random post
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      const post = randomPost.data;

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`🎬 Random GIF Meme from r/${randomSubreddit}`)
        .setDescription(`**${post.title}**`)
        .setImage(post.url)
        .setColor(0x00ff88)
        .addFields(
          { 
            name: '👍 Upvotes', 
            value: post.ups.toString(), 
            inline: true 
          },
          { 
            name: '💬 Comments', 
            value: post.num_comments.toString(), 
            inline: true 
          },
          { 
            name: '👤 Author', 
            value: `u/${post.author}`, 
            inline: true 
          }
        )
        .setFooter({ 
          text: `Requested by ${interaction.user.tag} • Powered by Reddit`, 
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();

      // Add Reddit link
      embed.addFields({
        name: '🔗 Reddit Post',
        value: `[View on Reddit](https://reddit.com${post.permalink})`,
        inline: false
      });

      // Add GIF info if available
      if (post.is_video) {
        embed.addFields({
          name: '🎥 Video',
          value: 'This is a video post',
          inline: true
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in gifmeme command:', error);
      
      let errorMessage = 'Failed to fetch GIF meme.';
      
      if (error.message.includes('Reddit API error')) {
        errorMessage = '❌ **Reddit API Error!**\n\nUnable to fetch GIF memes from Reddit.';
      } else if (error.message.includes('No GIF memes found')) {
        errorMessage = '😅 **No GIF memes found!**\n\nTry again in a few seconds.';
      } else {
        errorMessage = `❌ **Error:** ${error.message}`;
      }
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ GIF Meme Error')
        .setDescription(errorMessage)
        .setColor(0xff5555)
        .setFooter({ 
          text: `Requested by ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
}; 