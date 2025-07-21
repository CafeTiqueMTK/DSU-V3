const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

class UpdateChecker {
  constructor(client) {
    this.client = client;
    this.updatePath = path.join(__dirname, 'data', 'updates.json');
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
    this.isRunning = false;
  }

  // Start the update checker
  start() {
    if (this.isRunning) return;
    
    console.log('🔄 Starting GitHub update checker...');
    this.isRunning = true;
    this.checkForUpdates();
    
    // Set up interval
    setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
  }

  // Stop the update checker
  stop() {
    console.log('⏹️ Stopping GitHub update checker...');
    this.isRunning = false;
  }

  // Check for new commits and send notifications
  async checkForUpdates() {
    try {
      // Load update configuration
      if (!fs.existsSync(this.updatePath)) {
        return;
      }

      const updateConfig = JSON.parse(fs.readFileSync(this.updatePath, 'utf-8'));
      
      // Check each guild
      for (const [guildId, config] of Object.entries(updateConfig)) {
        if (!config.enabled || !config.channelId) continue;

        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) continue;

        const channel = guild.channels.cache.get(config.channelId);
        if (!channel) continue;

        // Check for new commits
        await this.checkGuildUpdates(guild, channel, config, guildId);
      }
    } catch (error) {
      console.error('Error in update checker:', error);
    }
  }

  // Check updates for a specific guild
  async checkGuildUpdates(guild, channel, config, guildId) {
    try {
      // Get repository info from environment or config
      const repoOwner = process.env.GITHUB_REPO_OWNER || 'CafeTiqueMTK';
      const repoName = process.env.GITHUB_REPO_NAME || 'DSU-V3';
      
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

      // Fetch latest commits
      const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=5`, { headers });
      
      if (!response.ok) {
        console.error(`GitHub API error for guild ${guild.name}: ${response.status}`);
        return;
      }

      const commits = await response.json();
      
      if (!commits || commits.length === 0) {
        return;
      }

      // Get the latest commit
      const latestCommit = commits[0];
      const latestCommitDate = new Date(latestCommit.commit.author.date);

      // Check if this is a new commit
      if (config.lastCommit) {
        const lastCommitDate = new Date(config.lastCommit);
        if (latestCommitDate <= lastCommitDate) {
          return; // No new commits
        }
      }

      // Update last commit timestamp
      config.lastCommit = latestCommitDate.toISOString();
      
      // Save updated config
      const updateConfig = JSON.parse(fs.readFileSync(this.updatePath, 'utf-8'));
      updateConfig[guildId] = config;
      fs.writeFileSync(this.updatePath, JSON.stringify(updateConfig, null, 2));

      // Send notification
      await this.sendUpdateNotification(channel, latestCommit, config.roleId);

    } catch (error) {
      console.error(`Error checking updates for guild ${guild.name}:`, error);
    }
  }

  // Send update notification to Discord
  async sendUpdateNotification(channel, commit, roleId) {
    try {
      const commitDate = new Date(commit.commit.author.date);
      const timestamp = Math.floor(commitDate.getTime() / 1000);
      
      const commitMessage = commit.commit.message;
      const shortMessage = commitMessage.split('\n')[0]; // Get first line only
      const author = commit.commit.author.name;
      const shortHash = commit.sha.substring(0, 7);
      
      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('🚀 New Update Available!')
        .setDescription(`**${shortMessage}**`)
        .setColor(0x00ff99)
        .setThumbnail('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')
        .addFields(
          { 
            name: '👤 Author', 
            value: author, 
            inline: true 
          },
          { 
            name: '🔗 Commit', 
            value: `[\`${shortHash}\`](${commit.html_url})`, 
            inline: true 
          },
          { 
            name: '📅 Date', 
            value: `<t:${timestamp}:R>`, 
            inline: true 
          }
        )
        .setFooter({ 
          text: 'DSU Update Notifications', 
          iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' 
        })
        .setTimestamp();

      // Add role ping if configured
      let content = '';
      if (roleId) {
        content = `<@&${roleId}>`;
      }

      await channel.send({ content: content || undefined, embeds: [embed] });
      console.log(`✅ Update notification sent to ${channel.name} in ${channel.guild.name}`);

    } catch (error) {
      console.error('Error sending update notification:', error);
    }
  }

  // Manual check for testing
  async manualCheck(guildId) {
    try {
      if (!fs.existsSync(this.updatePath)) {
        return { success: false, message: 'No update configuration found' };
      }

      const updateConfig = JSON.parse(fs.readFileSync(this.updatePath, 'utf-8'));
      const config = updateConfig[guildId];
      
      if (!config || !config.enabled) {
        return { success: false, message: 'Update notifications not enabled for this guild' };
      }

      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) {
        return { success: false, message: 'Guild not found' };
      }

      const channel = guild.channels.cache.get(config.channelId);
      if (!channel) {
        return { success: false, message: 'Channel not found' };
      }

      await this.checkGuildUpdates(guild, channel, config, guildId);
      return { success: true, message: 'Manual check completed' };

    } catch (error) {
      console.error('Error in manual check:', error);
      return { success: false, message: 'Error during manual check' };
    }
  }
}

module.exports = UpdateChecker; 