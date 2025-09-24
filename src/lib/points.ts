export function calculatePoints(difficulty: string, isDaily: boolean = false): number {
    const basePoints = {
        'Easy': 10,
        'Medium': 20,
        'Hard': 30
    };

    const points = basePoints[difficulty as keyof typeof basePoints] || 5;
    return isDaily ? points + 5 : points;
}

export function calculateLevelFromExp(exp: number): number {
    return Math.floor(Math.sqrt(exp / 10)) + 1;
}

export function getExpForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 10;
}

export function getExpRequiredForLevel(targetLevel: number): number {
    return Math.pow(targetLevel - 1, 2) * 10;
}