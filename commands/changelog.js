const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelog')
    .setDescription('Display the latest 3 commits from the bot repository'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      // GitHub API endpoint for commits
      const repoOwner = 'CafeTiqueMTK'; // Replace with actual repository owner
      const repoName = 'DSU-V3'; // Replace with actual repository name
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=3`;

      // GitHub API headers (add token if available)
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DSU-Bot/1.0'
      };
      
      // Add token if available (for private repos)
      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      // Fetch commits from GitHub API
      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository not found: ${repoOwner}/${repoName}. Please check if the repository exists and is public.`);
        } else if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
        }
      }

      const commits = await response.json();

      if (!commits || commits.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('📝 Changelog')
          .setDescription('No commits found in the repository.')
          .setColor(0xff5555)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('📝 Latest Commits - Changelog')
        .setDescription(`Showing the **3 latest commits** from the bot repository`)
        .setColor(0x00ff99)
        .setThumbnail('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')
        .setFooter({ 
          text: `Repository: ${repoOwner}/${repoName} • Requested by ${interaction.user.tag}`, 
          iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' 
        })
        .setTimestamp();

      // Add each commit as a field
      commits.forEach((commit, index) => {
        const commitDate = new Date(commit.commit.author.date);
        const timestamp = Math.floor(commitDate.getTime() / 1000);
        
        const commitMessage = commit.commit.message;
        const shortMessage = commitMessage.split('\n')[0]; // Get first line only
        const author = commit.commit.author.name;
        const shortHash = commit.sha.substring(0, 7);
        
        embed.addFields({
          name: `🔨 Commit #${index + 1} - ${shortHash}`,
          value: `**Message:** ${shortMessage}\n**Author:** ${author}\n**Date:** <t:${timestamp}:R>\n**Full Hash:** \`${commit.sha}\``,
          inline: false
        });
      });

      // Add repository link
      embed.addFields({
        name: '🔗 Repository',
        value: `[View on GitHub](https://github.com/${repoOwner}/${repoName})`,
        inline: false
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in changelog command:', error);
      
      let errorMessage = 'Failed to fetch commits from GitHub.';
      
      if (error.message.includes('Repository not found')) {
        errorMessage = `❌ **Repository not found or private!**\n\nThe repository \`${repoOwner}/${repoName}\` doesn't exist or is private.\n\n**To fix this:**\n• Make the repository public on GitHub\n• Or add a GitHub token to access private repos\n• Or update the repository name in the bot code`;
      } else if (error.message.includes('rate limit')) {
        errorMessage = '⏰ **GitHub API rate limit exceeded!**\n\nPlease try again in a few minutes.';
      } else if (error.message.includes('Network')) {
        errorMessage = '🌐 **Network error!**\n\nPlease check your internet connection and try again.';
      } else {
        errorMessage = `❌ **GitHub API Error:** ${error.message}`;
      }
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Changelog Error')
        .setDescription(errorMessage)
        .addFields(
          { name: '🔧 Solution', value: 'Contact the bot administrator to configure the correct repository.', inline: false }
        )
        .setColor(0xff5555)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
}; 