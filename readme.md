# DSU - Discord Server Utility Bot

DSU is a modern, all-in-one Discord bot for server management, moderation, automation, and community engagement. Designed for both small and large servers, DSU offers powerful tools to keep your community safe, organized, and fun.

---

## 🚀 Main Features

### Moderation & Automod
- **Automod:** Block Discord links, mention spam, ghost pings, bad words, and soft spam.
- **Custom sanctions:** Warn, mute, kick, ban, with automatic warn logging.
- **Role/channel ignore:** Exclude roles or channels from automod.
- **Moderator roles:** Assign roles that can use moderation commands.
- **Manual moderation:** `/ban`, `/kick`, `/warn`, `/mute`, `/unban`, `/unmute`, `/viewwarn`, `/clearwarn`, `/dm`, `/relay`, `/purge` (delete messages by type/channel).

### Logging System
- **Event logging:** Message edits/deletions, member joins/leaves, voice state updates, moderation actions.
- **Configurable:** Enable/disable logs per category (arrived, farewell, vocal, mod, automod).
- **Custom log channel.**

### Leveling System
- **XP & Levels:** Members gain XP by chatting. Level-up gets harder as you progress.
- **Role boosters:** Assign roles that multiply XP gain.
- **Level-up messages:** Customizable embed in a chosen channel.

### Economy & Streak
- **Coins system:** Earn coins by chatting, daily claim, or admin actions.
- **Account freeze:** Freeze/unfreeze user accounts.
- **Boosters:** Assign roles that multiply coin gain.
- **Leaderboard:** `/rank` shows the richest users.
- **Commands:** `/claim` (daily), `/mycoins`, `/ecoman addcoins|removecoins|freeze|setbooster`, `/rank`.

### Welcome & Farewell
- **Welcome:** Custom embed for new members.
- **Farewell:** Custom embed when a member leaves.

### Announcement System
- **Easy announcements:** Send announcements to any channel, with support for message presets.


### Utility & Fun
- **Wikipedia summaries:** `/wikipedia <query>`
- **Random images:** `/cat`, `/dog`
- **Relay:** `/relay` to send a message in another channel.
- **Purge:** `/purge all|bot channel:<channel>` to mass delete messages.

### Slash Commands
- **Modern management:** All features via intuitive slash commands.
- **Dynamic reload:** `/reloadcommand` to reload all commands without restart.

---

## ⚙️ Configuration

- **settings.json:** All server-specific configs are stored here (per guild).
- **No code editing required:** All features are configurable via slash commands.

---

## 🛠️ Example Slash Commands

- `/log enable|disable|status|reset`
- `/logchannelset channel:<channel>`
- `/automod enable|disable|status|category|sanction|ignore`
- `/moderatorrole role:<role> remove:true|false`
- `/level setchannel|setrolebooster|enable|disable|status|reset|messagetest`
- `/translation status|enable|disable|setup source:<lang> target:<lang>`
- `/ecoman addcoins|removecoins|freeze|setbooster`
- `/claim`, `/mycoins`, `/rank`, `/purge all|bot channel:<channel>`
- `/reloadcommand`

---

## 📝 Notes

- **Permissions:** The bot requires permissions to manage roles, kick/ban members, manage messages, and send embeds.
- **Translation:** Uses the public [LibreTranslate API](https://libretranslate.com/). For production, consider self-hosting or using an API key.
- **Leveling & Economy:** XP and coin gain are exponential and can be boosted by roles.
- **Automod:** All members (including admins) can be affected unless ignored by role/channel.

---

## 📄 License

MIT License

---

**DSU - Discord Server Utility Bot**  
*Made with ❤️ for your community!*
