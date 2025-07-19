const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme from Reddit'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      // List of popular meme subreddits
      const subreddits = [
        'memes',
        'dankmemes',
        'funny',
        'me_irl',
        'wholesomememes',
        'PewdiepieSubmissions',
        'teenagers',
        'okbuddyretard',
        'shitposting',
        'copypasta'
      ];

      // Pick a random subreddit
      const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

      // Fetch meme from Reddit API
      const response = await fetch(`https://www.reddit.com/r/${randomSubreddit}/hot.json?limit=50`);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      const posts = data.data.children.filter(post => {
        // Filter for image posts only
        const url = post.data.url;
        return url && (
          url.includes('.jpg') || 
          url.includes('.jpeg') || 
          url.includes('.png') || 
          url.includes('.gif') ||
          url.includes('imgur.com') ||
          url.includes('i.redd.it')
        );
      });

      if (posts.length === 0) {
        throw new Error('No memes found');
      }

      // Pick a random post
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      const post = randomPost.data;

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`😂 Random Meme from r/${randomSubreddit}`)
        .setDescription(`**${post.title}**`)
        .setImage(post.url)
        .setColor(0xff6b35)
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

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in meme command:', error);
      
      let errorMessage = 'Failed to fetch meme.';
      
      if (error.message.includes('Reddit API error')) {
        errorMessage = '❌ **Reddit API Error!**\n\nUnable to fetch memes from Reddit.';
      } else if (error.message.includes('No memes found')) {
        errorMessage = '😅 **No memes found!**\n\nTry again in a few seconds.';
      } else {
        errorMessage = `❌ **Error:** ${error.message}`;
      }
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Meme Error')
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