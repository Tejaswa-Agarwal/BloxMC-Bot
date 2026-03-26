# Discord Moderation & Utility Bot

A comprehensive Discord bot featuring moderation tools, utility commands, giveaway system, and automated features.

## 🌟 Features

### Moderation Commands
- **Ban/Unban**: Ban or unban users with reason tracking
- **Kick**: Remove users from the server
- **Timeout**: Temporarily mute users (1s - 28 days)
- **Purge**: Bulk delete messages
- **Purge User**: Delete specific user's messages

### Utility Commands
- **Help**: Display all available commands
- **Ping**: Check bot latency and response time
- **Avatar**: Display user avatars in high resolution
- **User Info**: Detailed user information (join date, roles, etc.)
- **Server Info**: Server statistics and information
- **Leaderboard**: XP ranking system

### Admin Commands
- **Announce**: Send formatted announcements to any channel
- **Command Toggle**: Enable/disable commands per server
- **Logging**: Set channel for command usage logs

### Additional Features
- **Giveaway System**: Create and manage giveaways
- **Auto Moderation**: Configurable message filtering
- **Logging System**: Track all command usage
- **XP/Leveling**: User activity tracking

## 🚀 Installation

### Prerequisites
- Node.js 16.9.0 or higher
- A Discord Bot Token ([Get one here](https://discord.com/developers/applications))

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discord-moderation-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   
   # Role IDs for permissions (comma-separated)
   ALLOWED_ROLE_IDS=role_id_1,role_id_2
   MODERATOR_ROLE_IDS=role_id_1,role_id_2
   ADMIN_ROLE_IDS=role_id_1,role_id_2
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

## 🔑 Permission System

The bot uses a role-based permission system:

- **ALLOWED_ROLE_IDS**: Can use giveaway commands
- **MODERATOR_ROLE_IDS**: Can use moderation commands (ban, kick, timeout, purge)
- **ADMIN_ROLE_IDS**: Can use admin commands + all moderation commands

Users with `ADMIN_ROLE_IDS` have access to all commands.

## 📝 Command Usage

### Prefix Commands (!)
```bash
k!ban @user Spamming
k!kick @user Breaking rules
k!timeout @user 10m Inappropriate behavior
k!purge 50
k!announce #general Important announcement
k!help
k!ping
k!avatar @user
k!userinfo @user
k!serverinfo
```

### Slash Commands (/)
```bash
/ban user:@user reason:Spamming
/kick user:@user reason:Breaking rules
/timeout user:@user duration:10m reason:Inappropriate behavior
/purge amount:50
/announce channel:#general message:Important announcement
/help
/ping
/avatar user:@user
/userinfo user:@user
/serverinfo
```

## 🎨 Command Categories

### Moderation
| Command | Description | Permission Required |
|---------|-------------|-------------------|
| ban | Ban a user | Moderator/Admin |
| unban | Unban a user | Moderator/Admin |
| kick | Kick a user | Moderator/Admin |
| timeout | Timeout a user | Moderator/Admin |
| purge | Delete messages | Moderator/Admin |
| purgeuser | Delete user messages | Moderator/Admin |

### Utility
| Command | Description | Permission Required |
|---------|-------------|-------------------|
| help | Show commands | Everyone |
| ping | Check latency | Everyone |
| avatar | Show avatar | Everyone |
| userinfo | User details | Everyone |
| serverinfo | Server stats | Everyone |
| leaderboard | XP rankings | Everyone |

### Admin
| Command | Description | Permission Required |
|---------|-------------|-------------------|
| announce | Send announcement | Admin |
| command | Toggle commands | Admin |
| logs | Set log channel | Admin |

### Giveaways
| Command | Description | Permission Required |
|---------|-------------|-------------------|
| giveaway | Create giveaway | Allowed Roles/Admin |
| giveaway-reroll | Reroll winner | Allowed Roles/Admin |

## 🛠️ Configuration

### Setting Up Roles

1. Get role IDs by enabling Developer Mode in Discord
2. Right-click roles → Copy ID
3. Add role IDs to `.env` file

### Command Toggle

Disable/enable commands per server:
```bash
k!command disable ban
k!command enable ban
```

### Logging Channel

Set up command logging:
```bash
/logs channel:#mod-logs
```

## 📦 Project Structure

```
├── commands/
│   ├── prefix/          # Prefix commands (!)
│   └── slash/           # Slash commands (/)
├── events/              # Event handlers
├── config/              # Configuration files
├── data/                # Data storage
├── index.js            # Main bot file
├── package.json        # Dependencies
└── .env                # Environment variables
```

## 🔧 Bot Permissions

The bot requires the following Discord permissions:
- Read Messages/View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Ban Members
- Kick Members
- Manage Messages
- Moderate Members (for timeout)

## 📊 Features in Detail

### Timeout Duration Format
- `10s` - 10 seconds
- `5m` - 5 minutes
- `1h` - 1 hour
- `7d` - 7 days
- Maximum: 28 days

### Purge Command
- Deletes up to 100 messages at once
- Can target specific users
- Messages older than 14 days cannot be bulk deleted (Discord limitation)

### Giveaway System
- Interactive button-based entries
- Automatic winner selection
- Reroll functionality
- Customizable duration and prizes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 💡 Support

For issues or questions:
1. Check the documentation
2. Look at existing GitHub issues
3. Create a new issue with details

## 🔄 Version History

### v2.0.0
- Complete refactor from Minecraft bot to general Discord bot
- Removed all Minecraft-specific features
- Added comprehensive moderation commands
- Added utility commands (help, ping, avatar, etc.)
- Added admin commands (announce, command toggle)
- Improved permission system
- Updated to Discord.js v14

---

Made with ❤️ for Discord communities
