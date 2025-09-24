import { LeetCode } from 'leetcode-query';

const leetcode = new LeetCode();

export interface QuestionInfo {
    slug: string;
    title: string;
    difficulty: string;
    questionId: string;
}

// Extract question slug from LeetCode URL
export function extractQuestionSlug(url: string): string | null {
    const match = url.match(/leetcode\.com\/problems\/([^\/\?]+)/);
    return match ? match[1] : null;
}

// Fetch question info from LeetCode using the third-party library
export async function getQuestionInfoFromUrl(solutionUrl: string): Promise<QuestionInfo | null> {
    try {
        const slug = extractQuestionSlug(solutionUrl);
        if (!slug) {
            throw new Error('Invalid LeetCode URL format');
        }

        const question = await leetcode.problem(slug);

        console.log('Fetched question info:', question);
        
        if (!question) {
            throw new Error('Question not found');
        }
        return {
            slug: question.titleSlug,
            title: question.title,
            difficulty: question.difficulty,
            questionId: question.questionId
        };
    } catch (error) {
        console.error('Error fetching question info:', error);
        return null;
    }
}

// Get question info by slug (useful for curated questions)
export async function getQuestionInfoBySlug(slug: string): Promise<QuestionInfo | null> {
    try {
        const question = await leetcode.problem(slug);
        
        if (!question) {
            throw new Error('Question not found');
        }
        
        return {
            slug: question.titleSlug,
            title: question.title,
            difficulty: question.difficulty,
            questionId: question.questionId
        };
    } catch (error) {
        console.error('Error fetching question info by slug:', error);
        return null;
    }
}

// Validate that a solution URL matches a specific question slug
export function validateSolutionUrl(solutionUrl: string, expectedSlug: string): boolean {
    const urlSlug = extractQuestionSlug(solutionUrl);
    return urlSlug === expectedSlug;
}

