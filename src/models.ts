export class Settings {
	millestones: number[] = [20, 50, 100];
	maxTriesPerMove = 4;
	maxTimePerMove = 10;
	sound = false;
	gobanWidth: number = 100;
}

export class MilestoneScore {
	constructor( public readonly milestone: number, public readonly percentage: number, public readonly finished: number) {}
}

export class Game {
	sgf: string = "";
	white: string = "";
	black: string = "";
	whiteRank: string = "";
	blackRank: string = "";
	event: string = "";
	date: string = "";
	result: string = "";
	milestones: MilestoneScore[] = [];
	movesCount = 0;
	currentTriesCount: number[] = [];
	currentMoveNumber = 0;
}

export function getBestMilestoneScore(milestone: number, game: Game) {
	let score = 0;
	let count = 0;
	for (const m of game?.milestones || []) {
		if (m.milestone == milestone && m.percentage > score) {
			score = m.percentage;
			count ++;
		}
	}
	return {score: score, count: count};
}