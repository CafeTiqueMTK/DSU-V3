const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('GitHub related commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('profile')
        .setDescription('Get GitHub profile information')
        .addStringOption(option =>
          option
            .setName('username')
            .setDescription('GitHub username to look up')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('repo')
        .setDescription('Get GitHub repository information')
        .addStringOption(option =>
          option
            .setName('owner')
            .setDescription('Repository owner (username or organization)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('repository')
            .setDescription('Repository name')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'profile') {
      await this.getGitHubProfile(interaction);
    } else if (subcommand === 'repo') {
      await this.getGitHubRepo(interaction);
    }
  },

  async getGitHubProfile(interaction) {
    try {
      await interaction.deferReply();

      const username = interaction.options.getString('username');

      // GitHub API headers
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DSU-Bot/1.0'
      };
      
      // Add token if available
      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      // Fetch user profile
      const response = await fetch(`https://api.github.com/users/${username}`, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User not found: ${username}`);
        } else if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        } else {
          throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
        }
      }

      const user = await response.json();

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`🐙 GitHub Profile: ${user.login}`)
        .setDescription(user.bio || 'No bio available')
        .setColor(0x24292e)
        .setThumbnail(user.avatar_url)
        .setURL(user.html_url)
        .addFields(
          { 
            name: '👤 Name', 
            value: user.name || 'Not specified', 
            inline: true 
          },
          { 
            name: '📍 Location', 
            value: user.location || 'Not specified', 
            inline: true 
          },
          { 
            name: '🏢 Company', 
            value: user.company || 'Not specified', 
            inline: true 
          },
          { 
            name: '📧 Email', 
            value: user.email || 'Not public', 
            inline: true 
          },
          { 
            name: '🌐 Blog', 
            value: user.blog ? `[${user.blog}](${user.blog})` : 'Not specified', 
            inline: true 
          },
          { 
            name: '📅 Created', 
            value: `<t:${Math.floor(new Date(user.created_at).getTime() / 1000)}:R>`, 
            inline: true 
          },
          { 
            name: '📊 Stats', 
            value: `**Repositories:** ${user.public_repos}\n**Gists:** ${user.public_gists}\n**Followers:** ${user.followers}\n**Following:** ${user.following}`, 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();

      // Add hireable status if available
      if (user.hireable !== null) {
        embed.addFields({
          name: '💼 Hireable',
          value: user.hireable ? 'Yes' : 'No',
          inline: true
        });
      }

      // Add Twitter if available
      if (user.twitter_username) {
        embed.addFields({
          name: '🐦 Twitter',
          value: `[@${user.twitter_username}](https://twitter.com/${user.twitter_username})`,
          inline: true
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in GitHub profile command:', error);
      
      let errorMessage = 'Failed to fetch GitHub profile.';
      
      if (error.message.includes('User not found')) {
        errorMessage = `❌ **User not found!**\n\nThe GitHub user \`${username}\` doesn't exist.`;
      } else if (error.message.includes('rate limit')) {
        errorMessage = '⏰ **GitHub API rate limit exceeded!**\n\nPlease try again in a few minutes.';
      } else {
        errorMessage = `❌ **GitHub API Error:** ${error.message}`;
      }
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ GitHub Profile Error')
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

  async getGitHubRepo(interaction) {
    try {
      await interaction.deferReply();

      const owner = interaction.options.getString('owner');
      const repo = interaction.options.getString('repository');

      // GitHub API headers
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DSU-Bot/1.0'
      };
      
      // Add token if available
      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      // Fetch repository information
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository not found: ${owner}/${repo}`);
        } else if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        } else {
          throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
        }
      }

      const repository = await response.json();

      // Get language colors if available
      const languageColor = repository.language ? await this.getLanguageColor(repository.language) : null;

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`📦 ${repository.name}`)
        .setDescription(repository.description || 'No description available')
        .setColor(languageColor || 0x24292e)
        .setThumbnail(repository.owner.avatar_url)
        .setURL(repository.html_url)
        .addFields(
          { 
            name: '👤 Owner', 
            value: `[${repository.owner.login}](${repository.owner.html_url})`, 
            inline: true 
          },
          { 
            name: '🔒 Visibility', 
            value: repository.private ? 'Private' : 'Public', 
            inline: true 
          },
          { 
            name: '⭐ Stars', 
            value: repository.stargazers_count.toString(), 
            inline: true 
          },
          { 
            name: '🍴 Forks', 
            value: repository.forks_count.toString(), 
            inline: true 
          },
          { 
            name: '👀 Watchers', 
            value: repository.watchers_count.toString(), 
            inline: true 
          },
          { 
            name: '📝 Issues', 
            value: repository.open_issues_count.toString(), 
            inline: true 
          },
          { 
            name: '💻 Language', 
            value: repository.language || 'Not specified', 
            inline: true 
          },
          { 
            name: '📅 Created', 
            value: `<t:${Math.floor(new Date(repository.created_at).getTime() / 1000)}:R>`, 
            inline: true 
          },
          { 
            name: '🔄 Updated', 
            value: `<t:${Math.floor(new Date(repository.updated_at).getTime() / 1000)}:R>`, 
            inline: true 
          }
        )
        .setFooter({ 
          text: `Requested by ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();

      // Add license if available
      if (repository.license) {
        embed.addFields({
          name: '📄 License',
          value: repository.license.name,
          inline: true
        });
      }

      // Add topics if available
      if (repository.topics && repository.topics.length > 0) {
        embed.addFields({
          name: '🏷️ Topics',
          value: repository.topics.slice(0, 5).map(topic => `\`${topic}\``).join(' '),
          inline: false
        });
      }

      // Add homepage if available
      if (repository.homepage) {
        embed.addFields({
          name: '🌐 Homepage',
          value: `[${repository.homepage}](${repository.homepage})`,
          inline: true
        });
      }

      // Add default branch
      embed.addFields({
        name: '🌿 Default Branch',
        value: repository.default_branch,
        inline: true
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in GitHub repo command:', error);
      
      let errorMessage = 'Failed to fetch GitHub repository.';
      
      if (error.message.includes('Repository not found')) {
        errorMessage = `❌ **Repository not found!**\n\nThe repository \`${owner}/${repo}\` doesn't exist or is not accessible.`;
      } else if (error.message.includes('rate limit')) {
        errorMessage = '⏰ **GitHub API rate limit exceeded!**\n\nPlease try again in a few minutes.';
      } else {
        errorMessage = `❌ **GitHub API Error:** ${error.message}`;
      }
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ GitHub Repository Error')
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

  async getLanguageColor(language) {
    try {
      const response = await fetch('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json');
      const colors = await response.json();
      return colors[language] ? parseInt(colors[language].color.replace('#', '0x')) : null;
    } catch (error) {
      return null;
    }
  },
}; 