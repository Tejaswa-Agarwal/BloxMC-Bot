# Discord Bot Commands

## 🛡️ Moderation Commands
| Command | Prefix | Slash | Description |
|---------|--------|-------|-------------|
| Ban | `k!ban <@user\|ID> [reason]` | `/ban <user> [reason]` | Ban a user from the server |
| Unban | `!unban <userID> [reason]` | `/unban <userid> [reason]` | Unban a user from the server |
| Kick | `k!kick <@user\|ID> [reason]` | `/kick <user> [reason]` | Kick a user from the server |
| Timeout | `k!timeout <@user\|ID> <duration> [reason]` | `/timeout <user> <duration> [reason]` | Timeout a user (duration: 10s, 5m, 1h, 1d) |
| Purge | `k!purge <amount>` | `/purge <amount>` | Delete multiple messages |
| Purge User | `!purgeuser <@user\|ID> <amount>` | `/purgeuser <user> <amount>` | Delete messages from specific user |

## 🔧 Utility Commands
| Command | Prefix | Slash | Description |
|---------|--------|-------|-------------|
| Help | `k!help` | `/help` | Show all available commands |
| Ping | `k!ping` | `/ping` | Check bot and API latency |
| Avatar | `k!avatar [@user]` | `/avatar [user]` | Display user's avatar |
| User Info | `k!userinfo [@user]` | `/userinfo [user]` | Show detailed user information |
| Server Info | `k!serverinfo` | `/serverinfo` | Show server statistics |
| Leaderboard | `!leaderboard` | `/leaderboard` | Show XP leaderboard |

## ⚙️ Admin Commands
| Command | Prefix | Slash | Description |
|---------|--------|-------|-------------|
| Announce | `k!announce <#channel\|ID> <message>` | `/announce <channel> <message>` | Send announcement to channel |
| Command Toggle | `k!command <enable\|disable> <command>` | `/command <action> <command>` | Enable or disable commands |
| Set Log Channel | N/A | `/logs <channel>` | Set the logging channel |

## 🎉 Giveaway Commands
| Command | Prefix | Slash | Description |
|---------|--------|-------|-------------|
| Giveaway | `!giveaway` | `/giveaway` | Create a new giveaway |
| Reroll | N/A | `/giveaway-reroll` | Reroll a giveaway winner |

## 📝 Additional Features
- **Automod**: Automatic message moderation (configurable)
- **Logging**: Command usage logging to designated channel
- **XP/Leveling System**: Track user activity and levels

## 🔑 Permissions
- **Moderation Commands**: Require `MODERATOR_ROLE_IDS` or `ADMIN_ROLE_IDS` (set in .env)
- **Admin Commands**: Require `ADMIN_ROLE_IDS` (set in .env)
- **Giveaway Commands**: Require `ALLOWED_ROLE_IDS` or `ADMIN_ROLE_IDS` (set in .env)

## 🚀 Setup
1. Create `.env` file with:
   ```
   DISCORD_TOKEN=your_bot_token
   ALLOWED_ROLE_IDS=role_id_1,role_id_2
   MODERATOR_ROLE_IDS=role_id_1,role_id_2
   ADMIN_ROLE_IDS=role_id_1,role_id_2
   ```
2. Install dependencies: `npm install`
3. Start bot: `npm start`
