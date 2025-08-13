// src/cron/daily.ts
import cron from "node-cron";
import dayjs from "dayjs";
import { Question } from "../models/Question";
import { DailyQuestion } from "../models/Daily";
import { Client, TextChannel } from "discord.js";

export function startDailyCron(client: Client, channelId: string) {
  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("Running daily question picker at", new Date().toISOString());

      try {
        const count = await Question.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        const randomQuestion = await Question.findOne().skip(randomIndex);

        if (!randomQuestion) {
          console.log("No questions available");
          return;
        }

        // Store today's daily question in the DB
        await DailyQuestion.create({
          questionId: randomQuestion._id,
          date: dayjs().format("YYYY-MM-DD"),
        });

        console.log("Daily question set:", randomQuestion.slug);

        // Post to Discord channel
        const channel = client.channels.cache.get(channelId);
        if (channel && channel.isTextBased()) {
          const msg = `@everyone today's leetcode question is **${randomQuestion.title}**: ${randomQuestion.link || "(link unavailable)"}`;
          (channel as TextChannel).send({ content: msg });
        } else {
          console.error("Could not find text channel with ID:", channelId);
        }
      } catch (err) {
        console.error("Error picking daily question:", err);
      }
    },
    {
      timezone: "America/Toronto", // Adjust to your timezone
    }
  );
}
