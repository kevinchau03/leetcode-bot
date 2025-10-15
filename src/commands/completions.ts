import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type { ChatInputCommandInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { Completion } from "../models/Completion";
import dayjs from "dayjs";

export const data = new SlashCommandBuilder()
    .setName("completions")
    .setDescription("View your recent LeetCode completions");

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply();
        
        const userId = interaction.user.id;
        const guildId = interaction.guildId!;

        const totalCompletions = await Completion.countDocuments({ userId, guildId });
        const totalPages = Math.ceil(totalCompletions / 5); // Changed to 5 per page

        if (totalCompletions === 0) {
            await interaction.editReply("You have no recorded completions yet. Use `/done` to log your first completion!");
            return;
        }

        await showCompletionsPage(interaction, userId, guildId, 1, totalPages);
        
    } catch (error) {
        console.error("Error in completions command:", error);
        await interaction.editReply("❌ An error occurred while fetching your completions.");
    }
}

async function showCompletionsPage(
    interaction: ChatInputCommandInteraction | ButtonInteraction, 
    userId: string, 
    guildId: string, 
    page: number, 
    totalPages: number
) {
    const skip = (page - 1) * 5; // Changed to 5 per page
    
    // Get completions for this page, sorted by most recent
    const completions = await Completion.find({ userId, guildId })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(5) // Changed to 5 per page
        .lean();

    const totalCompletions = await Completion.countDocuments({ userId, guildId });

    const embed = new EmbedBuilder()
        .setTitle("📚 Your LeetCode Completions")
        .setColor("#00ff00")
        .setDescription(`Showing ${skip + 1}-${Math.min(skip + 5, totalCompletions)} of ${totalCompletions} completions`)
        .setFooter({ text: `Page ${page} of ${totalPages}` });

    // Create completion list with shorter format to avoid character limit
    let completionsList = "";
    const buttons: ButtonBuilder[] = [];

    completions.forEach((completion, index) => {
        const number = skip + index + 1;
        const difficultyEmoji = getDifficultyEmoji(completion.difficulty);
        const typeEmoji = completion.isDaily ? "🎯" : "📝";
        const date = dayjs(completion.completedAt).format("MMM DD");
        
        // Shorter format to avoid character limit
        const title = completion.questionTitle.length > 25 
            ? completion.questionTitle.substring(0, 25) + "..." 
            : completion.questionTitle;
        
        completionsList += `${typeEmoji} **${number}.** ${title} ${difficultyEmoji}\n`;
        completionsList += `   *${date}* • ${completion.pointsEarned} XP${completion.timeTaken ? ` • ${completion.timeTaken}m` : ''}\n\n`;

        // Create button for this completion (now only 5 max)
        buttons.push(
            new ButtonBuilder()
                .setCustomId(`completion_details_${completion._id}`)
                .setLabel(`${number}`)
                .setStyle(completion.isDaily ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setEmoji(difficultyEmoji)
        );
    });

    embed.addFields([{
        name: "Recent Completions",
        value: completionsList || "No completions found.",
        inline: false
    }]);

    // Create action rows
    const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

    // Details buttons (all 5 completions)
    if (buttons.length > 0) {
        actionRows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons));
    }

    // Navigation buttons - simplified to just Previous/Next
    const navButtons: ButtonBuilder[] = [];
    
    if (page > 1) {
        navButtons.push(
            new ButtonBuilder()
                .setCustomId(`completions_page_${page - 1}`)
                .setLabel("◀ Previous")
                .setStyle(ButtonStyle.Secondary)
        );
    }

    if (page < totalPages) {
        navButtons.push(
            new ButtonBuilder()
                .setCustomId(`completions_page_${page + 1}`)
                .setLabel("Next ▶")
                .setStyle(ButtonStyle.Secondary)
        );
    }

    // Add refresh button
    navButtons.push(
        new ButtonBuilder()
            .setCustomId(`completions_refresh_${page}`)
            .setLabel("🔄 Refresh")
            .setStyle(ButtonStyle.Secondary)
    );

    if (navButtons.length > 0) {
        actionRows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(navButtons));
    }

    const response = {
        embeds: [embed],
        components: actionRows
    };

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply(response);
    } else {
        await interaction.reply(response);
    }
}

function getDifficultyEmoji(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
        case 'easy': return '🟢';
        case 'medium': return '🟡';
        case 'hard': return '🔴';
        default: return '⚪';
    }
}

// Handle button interactions
export async function handleCompletionsButton(interaction: ButtonInteraction) {
    const customId = interaction.customId;
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    try {
        if (customId.startsWith('completion_details_')) {
            // Show detailed modal for specific completion
            const completionId = customId.replace('completion_details_', '');
            await showCompletionDetails(interaction, completionId);
        } 
        else if (customId.startsWith('completions_page_')) {
            // Navigate to different page
            const page = parseInt(customId.replace('completions_page_', ''));
            const totalCompletions = await Completion.countDocuments({ userId, guildId });
            const totalPages = Math.ceil(totalCompletions / 5); // Changed to 5 per page
            await showCompletionsPage(interaction, userId, guildId, page, totalPages);
        }
        else if (customId.startsWith('completions_refresh_')) {
            // Refresh current page
            const page = parseInt(customId.replace('completions_refresh_', ''));
            const totalCompletions = await Completion.countDocuments({ userId, guildId });
            const totalPages = Math.ceil(totalCompletions / 5); // Changed to 5 per page
            await showCompletionsPage(interaction, userId, guildId, page, totalPages);
        }
    } catch (error) {
        console.error("Error handling completions button:", error);
        await interaction.reply({ 
            content: "❌ An error occurred while processing your request.", 
            ephemeral: true 
        });
    }
}

async function showCompletionDetails(interaction: ButtonInteraction, completionId: string) {
    try {
        const completion = await Completion.findById(completionId).lean();
        
        if (!completion) {
            await interaction.reply({
                content: "❌ Completion not found.",
                ephemeral: true
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`📋 ${completion.questionTitle}`)
            .setColor(completion.isDaily ? "#FFD700" : "#0099ff")
            .setDescription(`Completed on ${dayjs(completion.completedAt).format("MMMM DD, YYYY [at] h:mm A")}`)
            .addFields([
                {
                    name: "📊 Difficulty",
                    value: `${getDifficultyEmoji(completion.difficulty)} ${completion.difficulty}`,
                    inline: true
                },
                {
                    name: "💎 Points Earned",
                    value: `${completion.pointsEarned} XP`,
                    inline: true
                },
                {
                    name: "🎯 Type",
                    value: completion.isDaily ? "Daily Challenge" : "Practice Problem",
                    inline: true
                }
            ]);

        if (completion.timeTaken) {
            embed.addFields([{
                name: "⏱️ Time Taken",
                value: `${completion.timeTaken} minutes`,
                inline: true
            }]);
        }

        if (completion.solutionLink) {
            embed.addFields([{
                name: "🔗 Solution",
                value: `[View Solution](${completion.solutionLink})`,
                inline: true
            }]);
        }

        if (completion.notes) {
            embed.addFields([{
                name: "📝 Notes",
                value: completion.notes.length > 500 ? completion.notes.substring(0, 500) + "..." : completion.notes,
                inline: false
            }]);
        }

        // Add LeetCode link
        embed.addFields([{
            name: "🔗 LeetCode Problem",
            value: `[${completion.questionTitle}](https://leetcode.com/problems/${completion.questionSlug}/)`,
            inline: false
        }]);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    } catch (error) {
        console.error("Error showing completion details:", error);
        await interaction.reply({
            content: "❌ An error occurred while fetching completion details.",
            ephemeral: true
        });
    }
}
