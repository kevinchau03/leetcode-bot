# Eleet - LeetCode Discord Bot

A Discord bot that helps users track daily LeetCode practice with streaks, automated daily questions, and community engagement. It is a user's companion that helps them stay on track with their grind. So that they can become ELITE!

## Features

- 📅 **Daily Questions** - Automatically posts new LeetCode questions daily
- 🔥 **Streak Tracking** - Track your daily coding streaks
- 📊 **Profile Stats** - View personal progress and statistics  
- 🌍 **Timezone Support** - Respects user timezones
- 👥 **Public Progress** - Share achievements with your server

## Commands

- `/completions` - View all completed questions
- `/daily` - View today's LeetCode question
- `/done [tz] [solution] [time] [notes]` - Mark today's question as completed
- `/profile` - View your streak and stats
- `/allquestions` - Browse available questions
- `/leaderboard` - View the leaderboard


## Setup

1. Clone the repository
```bash
git clone https://github.com/kevinchau03/leetcode-bot.git
cd leetcode-bot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (see below)

4. Build and start
```bash
npm run build
npm start
```

## Environment Variables

You can paste in your own environmental variables to test on your own server.

## Tech Stack

- **Node.js** + **TypeScript**
- **Discord.js** v14
- **MongoDB** + **Mongoose**
- **Day.js** for timezone handling
- **node-cron** for scheduling

## Author

Kevin Chau - Check out my profile and other projects if you'd like

