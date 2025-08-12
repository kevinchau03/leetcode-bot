"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const Question_1 = require("../models/Question");
async function execute(interaction) {
    await interaction.deferReply();
    try {
        const questions = await Question_1.Question.find({}).lean();
        if (!questions.length) {
            return interaction.editReply("No questions found in the database.");
        }
        const list = questions
            .map((q, i) => `${i + 1}. **${q.title}** (${q.difficulty}) → [Link](${q.link})`)
            .join("\n");
        if (list.length > 2000) {
            const chunks = list.match(/[\s\S]{1,1900}/g) || [];
            for (let chunk of chunks) {
                await interaction.followUp(chunk);
            }
            return;
        }
        await interaction.editReply(list);
    }
    catch (err) {
        console.error(err);
        await interaction.editReply("❌ Error fetching questions.");
    }
}
