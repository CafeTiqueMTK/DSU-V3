const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelog')
    .setDescription('Display the latest 3 commits from the bot repository'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      // GitHub API endpoint for commits
      const repoOwner = 'ThomasSirurguet'; // Replace with actual repository owner
      const repoName = 'DSU-V3'; // Replace with actual repository name
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=3`;

      // Fetch commits from GitHub API
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
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
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Changelog Error')
        .setDescription('Failed to fetch commits from GitHub. This could be due to:\n• Repository not found\n• API rate limit exceeded\n• Network issues')
        .setColor(0xff5555)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
}; 