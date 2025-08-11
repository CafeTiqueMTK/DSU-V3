# 🤖 DSU V3 - Discord Server Utility Bot

[![Discord.js](https://img.shields.io/badge/Discord.js-14.19.3-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**DSU V3** is a modern, all-in-one Discord bot for server management, moderation, automation, and community engagement. Designed for servers of all sizes, DSU offers powerful tools to keep your community safe, organized, and fun.

---

## 🚀 Main Features

### 🛡️ **Advanced Moderation & Automod System**
- **Multi-guild protection**: Separate configuration for each server
- **Anti-role mentions**: Block specific roles from being mentioned
- **Anti-bot protection**: Automatically kick unauthorized bots
- **Anti-raid system**: Detect and respond to mass joins (3-20 users in 10s)
- **Advanced automod**: Block Discord links, mention spam, ghost pings, blacklisted words, soft spam
- **Anti-spam protection**: Detects spam with configurable thresholds
- **Anti-invite protection**: Automatically blocks Discord invites
- **Anti-link protection**: Blocks external links
- **Custom keyword blacklist**: Fully customizable forbidden words system
- **Automatic sanctions**: Warn, mute, kick, ban with automatic logging
- **Role/channel ignore**: Exclude roles or channels from automod
- **Moderator roles**: Assign roles that can use moderation commands

### 🔧 **Smart Guild Management System**
- **Automatic data initialization**: Each server gets its own configuration
- **Persistent data storage**: All settings saved per guild
- **Railway volume support**: Data persists across deployments
- **Error handling**: Robust system for data management
- **Configuration separation**: No conflicts between servers

### 📊 **Comprehensive Logging System**
- **Event logging**: Message edits/deletions, member joins/leaves, voice state changes, moderation actions
- **Flexible configuration**: Enable/disable logs per category
- **Custom log channel**: Choose where to send logs
- **Log categories**: Join, leave, voice, moderation, automod, commands, roles, soundboard, tickets, channels, economy, bulk delete, messages, invites

### 🎮 **Enhanced Leveling System**
- **XP & Levels**: Members earn XP by chatting. Leveling up gets harder as you progress
- **Role boosters**: Assign roles that multiply XP gain
- **Level-up messages**: Customizable embeds in a chosen channel
- **Full configuration**: Channel, boosters, enable/disable

### 💰 **Improved Economy & Games System**
- **Coin system**: Earn coins by chatting, daily claim, or admin actions
- **Account freeze**: Freeze/unfreeze user accounts
- **Boosters**: Assign roles that multiply coin gain
- **Leaderboard**: `/rank` shows the richest users
- **Enhanced RPS game**: Rock-paper-scissors with 100 coin rewards (no minimum required)
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
- **What is it**: `/whatisit` - Comprehensive bot feature explanation

### 🎫 **Ticket System**
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
- **Persistent settings**: Configuration survives bot updates

### 🎨 **Autorole System**
- **Automatic assignment**: Auto-roles for new members
- **Simple configuration**: Role, enable/disable

### 📢 **Announcement System**
- **Easy announcements**: Send announcements to any channel
- **Message presets**: Predefined messages for announcements
- **Flexible configuration**: Channel, enable, test

### 💒 **Marriage System**
- **Marriage proposals**: Propose marriage to other users
- **Romantic interactions**: Kiss, hug, cuddle, hold hands
- **Marriage management**: Divorce, marriage info, statistics
- **Announcement system**: Share marriages and divorces

---

## 📋 Full Command List

### 👑 **Admin Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/help admin` | Show admin commands | Administrator |
| `/whatisit` | Comprehensive bot feature explanation | Everyone |
| `/automod enable/disable/status` | Automod management | Administrator |
| `/automod actionchannel` | Set automod action channel | Administrator |
| `/automod addkeywords/remkeywords/listkeywords` | Blacklist management | Administrator |
| `/automod pingrole add/del/list` | Blocked roles management | Administrator |
| `/anti massmention` | Anti mass mention protection | Administrator |
| `/anti spam` | Anti spam protection | Administrator |
| `/anti invites` | Anti invite protection | Administrator |
| `/anti links` | Anti link protection | Administrator |
| `/anti keywords` | Anti keyword protection | Administrator |
| `/anti roles` | Anti role mention protection | Administrator |
| `/anti bot` | Anti bot protection | Administrator |
| `/anti raid` | Anti raid protection (3-20 joins in 10s) | Administrator |
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
| `/mod ban` | Ban a user | Moderator/Administrator |
| `/mod kick` | Kick a user | Moderator/Administrator |
| `/mod warn` | Warn a user | Moderator/Administrator |
| `/mod mute` | Mute a user (with duration) | Moderator/Administrator |
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
| `/rps` | Rock-paper-scissors (winner gets 100 coins) | Everyone |
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
| `/askgemini` | Ask questions to Google Gemini AI | Everyone |

### 🎫 **Ticket Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/ticket` | Ticket management | Moderator |

### 🏷️ **Reaction Role Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/reactionrole` | Reaction role configuration | Administrator |
| `/reactionrole-emoji` | Emoji-based reaction roles | Administrator |

### 💒 **Marriage Commands**
| Command | Description | Permissions |
|----------|-------------|-------------|
| `/marry` | Propose marriage to someone | Everyone |
| `/divorce` | Divorce from current partner | Everyone |
| `/marriageinfo` | View marriage information | Everyone |
| `/marriagestats` | View marriage statistics | Everyone |
| `/marriagelist` | List all active marriages | Everyone |
| `/marrysys` | Marriage system configuration | Administrator |
| `/kiss` | Kiss someone | Everyone |
| `/hug` | Hug someone | Everyone |
| `/cuddle` | Cuddle with someone | Everyone |
| `/holdhands` | Hold hands with someone | Everyone |

---

## 🎫 Ticket System

### 🎯 Main Features
- **Complete system**: Customizable creation form, automatic welcome embeds, pingable support role
- **Modern interface**: Interactive buttons, form modals, custom embeds, ephemeral messages
- **Advanced management**: One ticket per user limit, automatic permissions, dedicated category, priority system

### 🚀 Initial Setup
```
/ticket setup channel:#support support_role:@Support tickets_category:"Tickets" title:"🎫 Support System" description:"Click the button below to create a support ticket." button_text:"Create Ticket"
```

**Parameters:**
- `channel`: Channel to display the creation message
- `support_role`: Role that will be mentioned in tickets
- `tickets_category`: Category where tickets will be created
- `title`: Title of the creation message
- `description`: Description of the message
- `button_text`: Button text (optional)

### 📋 Available Commands
- **`/ticket setup`** - Initial system configuration
- **`/ticket config`** - Modify settings
- **`/ticket list`** - List all open tickets
- **`/ticket close`** - Close a specific ticket
- **`/ticket transcript`** - Generate a transcript

### 🎫 Ticket Creation Process
1. **Button click**: User clicks "Create Ticket" button in configured channel
2. **Automatic form**: Form opens with fields: Reason, Description, Priority
3. **Channel creation**: Bot creates new channel with appropriate permissions
4. **Support notification**: Support role is mentioned with ticket details

---

## 🏷️ Reaction Role System

### 🎯 System 1: Button-based Reaction Roles
**Command**: `/reactionrole`

**Setup example:**
```
/reactionrole setup channel:#roles title:"Choose your roles" description:"Click the buttons to get your roles" role1:@Gamer label1:"Gamer" role2:@Music label2:"Music" role3:@News label3:"News"
```

**Features:**
- ✅ Up to 5 roles per message
- ✅ Buttons organized in rows of 3 maximum
- ✅ Automatic toggle (add/remove role)
- ✅ Automatic action logging
- ✅ Ephemeral confirmation messages

### 🎨 System 2: Emoji-based Reaction Roles
**Command**: `/reactionrole-emoji`

**Setup example:**
```
/reactionrole-emoji setup channel:#roles title:"Choose your roles" description:"React with emojis to get your roles" role1:@Gamer emoji1:"🎮" role2:@Music emoji2:"🎵" role3:@News emoji3:"📰"
```

**Features:**
- ✅ Up to 5 roles per message
- ✅ Emojis automatically added to message
- ✅ Automatic role add/remove
- ✅ Automatic action logging
- ✅ Support for Unicode and custom emojis

---

## 💒 Marriage System

### 🎯 Features
- **Marriage commands**: Propose, divorce, marriage info, statistics
- **Romantic interactions**: Kiss, hug, cuddle, hold hands
- **Announcement system**: Share marriages and divorces
- **Statistics tracking**: Marriage rates, divorce rates, success rates

### 💍 Marriage Commands
- **`/marry @user`** - Propose marriage to someone
- **`/divorce`** - Divorce from current partner
- **`/marriageinfo [@user]`** - View marriage information
- **`/marriagestats`** - View marriage statistics
- **`/marriagelist`** - List all active marriages
- **`/marrysys setchannel #channel`** - Configure announcement channel (Admin)
- **`/marrysys status`** - View system configuration (Admin)

### 💕 Romantic Interaction Commands
- **`/kiss @user`** - Kiss someone
- **`/hug @user`** - Hug someone
- **`/cuddle @user`** - Cuddle with someone
- **`/holdhands @user`** - Hold hands with someone

### 🚀 How to Use
1. **Propose Marriage**: `/marry @user` - An embed with buttons will appear
2. **Romantic Interactions**: Use `/kiss`, `/hug`, `/cuddle`, `/holdhands` with @user
3. **Marriage Management**: `/divorce` to divorce, `/marriageinfo` to view status
4. **Configuration**: `/marrysys setchannel #channel` to configure announcement channel

---

## 📁 Data Migration

### 🎯 Objective
All bot commands now use the `/data` folder to store their data, enabling:
- **Data persistence**: Data is not lost during restarts
- **Railway volume**: Use Railway persistent volume for storage
- **Centralization**: All data files are in a single folder

### 📁 Migrated Files
The following files are now stored in `/data`:
- `settings.json` - General bot configuration
- `warns.json` - Warning system
- `coins.json` - Economy system
- `work.json` - Work system
- `tickets.json` - Ticket system
- `reaction_roles.json` - Reaction roles
- `reaction_roles_emoji.json` - Emoji reaction roles
- `updates.json` - Update notifications
- `automod_actions.json` - Automod actions
- `funnymsg.json` - Funny messages
- `presets.json` - Configuration presets
- `config.json` - Bot configuration

### 🚀 Automatic Migration
**For Railway:**
1. **Deploy the bot**: Migration script runs automatically
2. **Check logs**: Data is migrated to `/data`
3. **Persistent volume**: Data is now persistent

**For local development:**
```bash
# Run migration manually
npm run migrate-data

# Or run full Railway setup
npm run setup-railway
```

---

## 🛡️ New Protection Features

### 🎭 **Anti-Role Mentions**
- **Block specific roles**: Prevent certain roles from being mentioned
- **Automatic detection**: Real-time monitoring of role mentions
- **Message deletion**: Remove messages with blocked role mentions
- **DM warnings**: Notify users about violations
- **Complete logging**: Track all violations in automod logs

### 🤖 **Anti-Bot Protection**
- **Unauthorized bot detection**: Identify and kick unauthorized bots
- **Smart filtering**: Allow verified bots and bots with proper permissions
- **Automatic response**: Kick bots that don't meet criteria
- **Detailed logging**: Track all bot join attempts
- **Permission validation**: Check for proper OAuth2 scopes

### 🚨 **Anti-Raid System**
- **Mass join detection**: Detect 3-20 joins within 10 seconds
- **Configurable threshold**: Adjust sensitivity per server
- **Automatic response**: Kick recent joins and lockdown server
- **Server lockdown**: Delete all invites to prevent further raids
- **Comprehensive logging**: Detailed raid reports and statistics

### 🔧 **Enhanced Guild Management**
- **Multi-server support**: Independent configuration per server
- **Automatic initialization**: Create settings for new servers
- **Persistent data**: All configurations survive bot restarts
- **Railway optimization**: Perfect for Railway deployment
- **Error handling**: Robust system for data management

---

## ⚙️ Configuration

### 📁 **Data Structure**
```
/data/
├── settings.json      # Server configuration (per guild)
├── coins.json         # User economy
├── work.json          # Work cooldowns
├── funnymsg.json      # Funny message config
├── warns.json         # Warnings (per guild)
├── tickets.json       # Ticket system data
├── reaction_roles.json # Button reaction roles
├── reaction_roles_emoji.json # Emoji reaction roles
├── marriage-data.json # Marriage system data
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

# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_api_key

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
- **Multi-guild support** with persistent configurations

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

- **60+ available commands**
- **15+ integrated systems**
- **English language support**
- **Web configuration interface**
- **Comprehensive logging**
- **Automatic backup system**
- **Multi-guild support**
- **Advanced protection systems**
- **Integrated APIs**: Reddit, GitHub, Wikipedia, Weather

---

## 🔒 Required Permissions

The bot requires the following permissions:
- **Manage Roles**: For autoroles and reaction roles
- **Kick Members**: For moderation and anti-bot/anti-raid
- **Ban Members**: For moderation
- **Manage Messages**: For automod and cleaning
- **Send Messages**: For replies and logs
- **Embed Links**: For formatted messages
- **Attach Files**: For images and memes
- **Read Message History**: For logs
- **Manage Server**: For anti-raid lockdown

---

## 🆘 Support & Troubleshooting

### Common Issues
1. **Bot not responding**: Check permissions and token
2. **Lost data**: Use automatic backups
3. **Commands not recognized**: Use `/reloadcommand`
4. **Multi-guild issues**: Check guild management system
5. **Protection not working**: Verify configuration with `/automod status`

### Logs & Debugging
- All events are logged in the configured channel
- Errors are shown in the console
- Use `/status` to check bot status
- Use `/whatisit` for feature explanations

### 🔧 Troubleshooting Guide

#### SIGTERM / npm Error Solutions

**1. Check Environment Variables**
Ensure your `.env` file contains all necessary variables:
```env
DISCORD_TOKEN=your_discord_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
```

**2. Test Startup**
Use the test script to diagnose issues:
```bash
node test-startup.js
```

**3. Use Simplified Startup Script**
If the main `index.js` file has issues, use the simplified script:
```bash
node start-bot.js
```

**4. Check Dependencies**
Ensure all dependencies are installed:
```bash
npm install discord.js dotenv
```

**5. Verify Bot Permissions**
The bot must have these permissions:
- `Send Messages`
- `Use Slash Commands`
- `Embed Links`
- `Attach Files`
- `Read Message History`

#### Quick Solutions

**Solution 1: Restart with Simplified Script**
```bash
node start-bot.js
```

**Solution 2: Check Logs**
```bash
node test-startup.js
```

**Solution 3: Reinstall Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Solution 4: Verify Discord Token**
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Verify your bot token is correct
- Ensure the bot is invited to your server

#### Diagnostic Checklist
- [ ] `.env` file exists and contains correct variables
- [ ] Discord token is valid
- [ ] Bot is invited to server
- [ ] Bot has correct permissions
- [ ] All command files are present
- [ ] Dependencies are installed
- [ ] Node.js version 18+ is installed

#### Common Error Logs

**"Missing required environment variables"**
- Check your `.env` file
- Ensure no spaces around `=`

**"Commands directory not found"**
- Verify `commands/` directory exists
- Ensure all `.js` files are present

**"Failed to load command file"**
- Check command file syntax
- Ensure `module.exports` is correct

**"Discord client error"**
- Verify your Discord token
- Ensure bot is online in developer portal

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

- [x] Multi-guild support with persistent data
- [x] Anti-role mention protection
- [x] Anti-bot protection system
- [x] Anti-raid detection and response
- [x] Enhanced guild management
- [x] Comprehensive bot feature explanation
- [x] Ticket system with interactive interface
- [x] Reaction role system with buttons and emojis
- [x] Marriage system with romantic interactions
- [x] Data migration to persistent storage
- [ ] Full multi-language support
- [ ] Music system
- [ ] Advanced poll system
- [ ] More API integrations
- [ ] Improved web interface
- [ ] Plugin system
- [ ] Advanced analytics and statistics
