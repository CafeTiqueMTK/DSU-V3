# 🤖 DSU V3 - Discord Server Utility Bot

[![Discord.js](https://img.shields.io/badge/Discord.js-14.19.3-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**DSU V3** is a modern, all-in-one Discord bot for server management, moderation, automation, and community engagement. Designed for servers of all sizes, DSU offers powerful tools to keep your community safe, organized, and fun.

---

## 🚀 Main Features

### 🛡️ **Moderation & Automod System**
- **Advanced automod**: Block Discord links, mention spam, ghost pings, blacklisted words, soft spam
- **Anti-spam protection**: Detects spam with configurable thresholds
- **Anti-invite protection**: Automatically blocks Discord invites
- **Anti-link protection**: Blocks external links
- **Custom keyword blacklist**: Fully customizable forbidden words system
- **Automatic sanctions**: Warn, mute, kick, ban with automatic logging
- **Role/channel ignore**: Exclude roles or channels from automod
- **Moderator roles**: Assign roles that can use moderation commands

### 📊 **Comprehensive Logging System**
- **Event logging**: Message edits/deletions, member joins/leaves, voice state changes, moderation actions
- **Flexible configuration**: Enable/disable logs per category
- **Custom log channel**: Choose where to send logs
- **Log categories**: Join, leave, voice, moderation, automod, commands, roles, soundboard, tickets, channels, economy, bulk delete, messages, invites

### 🎮 **Leveling System**
- **XP & Levels**: Members earn XP by chatting. Leveling up gets harder as you progress
- **Role boosters**: Assign roles that multiply XP gain
- **Level-up messages**: Customizable embeds in a chosen channel
- **Full configuration**: Channel, boosters, enable/disable

### 💰 **Economy & Games System**
- **Coin system**: Earn coins by chatting, daily claim, or admin actions
- **Account freeze**: Freeze/unfreeze user accounts
- **Boosters**: Assign roles that multiply coin gain
- **Leaderboard**: `/rank` shows the richest users
- **RPS game**: Rock-paper-scissors with 100 coin bets
- **/work command**: Random jobs every hour to earn 50-200 coins
- **Streaks**: Daily claim streak system

### 🎭 **Funny Message System**
- **Automatic detection**: Auto-replies based on trigger phrases
- **Admin configuration**: Only admins can configure the system
- **English-only triggers**: Optimized for English phrases
- **Configurable cooldown**: Prevents spam
- **Categories**: Eat, sleep, game, work

### 🎪 **Fun & Entertainment Commands**
- **Rating system**: `/gayrater`, `/hotrater`, `/chadrater`, `/poorrater`, `/smartrater`
- **Random images**: `/cat`, `/dog` with API images
- **Memes**: `/meme` and `/gifmeme` from Reddit
- **GitHub info**: `/github profile` and `/github repo`
- **Changelog**: `/changelog` to see the latest GitHub commits
- **Server info**: `/guildinfo` with detailed stats

### 🎯 **Ticket System**
- **Interactive tickets**: Create tickets with buttons
- **Full management**: Open, close, archive
- **Automatic logging**: All actions are logged
- **Flexible configuration**: Channel, roles, permissions

### 🏷️ **Reaction Role System**
- **Reaction roles**: Assign roles via reactions
- **Emoji configuration**: Supports custom emojis
- **Full management**: Add, remove, list roles

### 👋 **Welcome & Farewell System**
- **Welcome messages**: Customizable embeds for new members
- **Farewell messages**: Customizable embeds when a member leaves
- **Full configuration**: Enable, channel, test messages

### 🎨 **Autorole System**
- **Automatic assignment**: Auto-roles for new members
- **Simple configuration**: Role, enable/disable

### 📢 **Announcement System**
- **Easy announcements**: Send announcements to any channel
- **Message presets**: Predefined messages for announcements
- **Flexible configuration**: Channel, enable, test

---

## 📋 Full Command List

### 👑 **Admin Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/help admin` | Show admin commands | Administrator |
| `/automod enable/disable/status` | Automod management | Administrator |
| `/automod actionchannel` | Set automod action channel | Administrator |
| `/automod addkeywords/remkeywords/listkeywords` | Blacklist management | Administrator |
| `/anti` | Anti-spam/invite/link protection | Administrator |
| `/setmoderatorrole` | Set moderator role | Administrator |
| `/logconfig` | Log system configuration | Administrator |
| `/warnconfig` | Warning system configuration | Administrator |
| `/muteconfig` | Mute system configuration | Administrator |
| `/level` | Level system configuration | Administrator |
| `/welcome` | Welcome message configuration | Administrator |
| `/farewell` | Farewell message configuration | Administrator |
| `/autorole` | Autorole configuration | Administrator |
| `/funnymsg` | Funny message configuration | Administrator |
| `/botreset` | Reset all bot data | Administrator |
| `/reloadcommand` | Reload commands without restart | Administrator |
| `/dashboard` | Web configuration interface | Administrator |

### 🛡️ **Moderator Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/help moderator` | Show moderator commands | Moderator |
| `/mod ban` | Ban a user | Moderator |
| `/mod kick` | Kick a user | Moderator |
| `/mod warn` | Warn a user | Moderator |
| `/mod mute` | Mute a user (with duration) | Moderator |
| `/unban` | Unban a user | Moderator |
| `/unmute` | Unmute a user | Moderator |
| `/viewwarn` | View a user's warnings | Moderator |
| `/clearwarn` | Clear a user's warnings | Moderator |
| `/purge` | Bulk delete messages | Moderator |
| `/clearmsg` | Clean messages | Moderator |
| `/dm` | Send a private message | Moderator |
| `/relay` | Relay a message to another channel | Moderator |

### 👥 **User Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/help user` | Show user commands | Everyone |
| `/ping` | Bot latency | Everyone |
| `/about` | About the bot | Everyone |
| `/aboutme` | About you | Everyone |
| `/userinfo` | User info | Everyone |
| `/guildinfo` | Detailed server info | Everyone |
| `/status` | Bot status | Everyone |
| `/license` | Bot license | Everyone |

### 🎮 **Fun & Game Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/gayrater` | Rate "gayness" (for fun) | Everyone |
| `/hotrater` | Rate attractiveness (for fun) | Everyone |
| `/chadrater` | Rate "chadness" (for fun) | Everyone |
| `/poorrater` | Rate "poorness" (for fun) | Everyone |
| `/smartrater` | Rate intelligence (for fun) | Everyone |
| `/rps` | Rock-paper-scissors with bets | Everyone |
| `/work` | Work to earn coins | Everyone |
| `/cat` | Random cat image | Everyone |
| `/dog` | Random dog image | Everyone |
| `/meme` | Random meme from Reddit | Everyone |
| `/gifmeme` | Random GIF meme from Reddit | Everyone |

### 💰 **Economy Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/claim` | Daily coin claim | Everyone |
| `/mycoins` | View your coins | Everyone |
| `/rank` | Richest leaderboard | Everyone |
| `/streak` | View your claim streak | Everyone |
| `/ecoman` | Economy management (admin) | Administrator |

### 🔧 **Utility Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/wikipedia` | Wikipedia summary | Everyone |
| `/weather` | City weather | Everyone |
| `/github profile` | GitHub user profile | Everyone |
| `/github repo` | GitHub repository info | Everyone |
| `/changelog` | Latest GitHub commits | Everyone |

### 🎫 **Ticket Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/ticket` | Ticket management | Moderator |

### 🏷️ **Reaction Role Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/reactionrole` | Reaction role configuration | Administrator |
| `/reactionrole-emoji` | Emoji-based reaction roles | Administrator |

---

## ⚙️ Configuration

### 📁 **Data Structure**
```
/data/
├── settings.json      # Server configuration
├── coins.json         # User economy
├── work.json          # Work cooldowns
├── funnymsg.json      # Funny message config
├── warns.json         # Warnings
└── backup/            # Automatic backups
```

### 🔧 **Environment Variables**
```env
# Discord Bot
DISCORD_TOKEN=your_discord_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id

# GitHub (optional)
GITHUB_TOKEN=your_github_token

# Environment
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

### 🚂 **Railway Deployment**
The bot is optimized for Railway with:
- **Persistent volumes** for data
- **Secure environment variables**
- **Automatic deployment** from GitHub
- **Automatic data backups**

See `RAILWAY_SETUP.md` for full setup instructions.

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- Discord Bot Token
- Proper Discord permissions

### Local Installation
```bash
# Clone the repository
git clone https://github.com/your-username/DSU-V3.git
cd DSU-V3

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your tokens

# Migrate existing data (if applicable)
node migrate-data.js

# Start the bot
npm start
```

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set up environment variables
3. Create a persistent volume for `/app/data`
4. Deploy!

---

## 📊 Bot Stats

- **50+ available commands**
- **10+ integrated systems**
- **English language support**
- **Web configuration interface**
- **Comprehensive logging**
- **Automatic backup system**
- **Integrated APIs**: Reddit, GitHub, Wikipedia, Weather

---

## 🔒 Required Permissions

The bot requires the following permissions:
- **Manage Roles**: For autoroles and reaction roles
- **Kick Members**: For moderation
- **Ban Members**: For moderation
- **Manage Messages**: For automod and cleaning
- **Send Messages**: For replies and logs
- **Embed Links**: For formatted messages
- **Attach Files**: For images and memes
- **Read Message History**: For logs

---

## 🆘 Support

### Common Issues
1. **Bot not responding**: Check permissions and token
2. **Lost data**: Use automatic backups
3. **Commands not recognized**: Use `/reloadcommand`

### Logs & Debugging
- All events are logged in the configured channel
- Errors are shown in the console
- Use `/status` to check bot status

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

**DSU V3 - Discord Server Utility Bot**  
*Made with ❤️ for your community!*

---

## 📈 Roadmap

- [ ] Full multi-language support
- [ ] Music system
- [ ] Advanced poll system
- [ ] More API integrations
- [ ] Improved web interface
- [ ] Plugin system
- [ ] Advanced analytics and statistics
