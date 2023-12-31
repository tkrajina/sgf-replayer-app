import { Fragment, h } from 'preact';
import { Link } from 'preact-router';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { BaseScreen } from '../../components/BaseScreen';
import { Game, MilestoneScore, Settings, getBestMilestoneScore } from '../../models';
import { gamesService } from '../../services/GamesService';
import { GameDesc } from '../../components/GameDesc';

export const GamesPage = () => {
	const [games, setGames] = useState([] as Game[]);
	const settings = gamesService.loadSettings();
	const reload = () => {
		setGames(gamesService.loadGames());
	}

	useEffect(() => {
		reload();
	}, []);

	const onDelete = useCallback((g: Game) => {
		if (window.confirm("Really delete?")) {
			gamesService.delete(g);
			reload();
		}
	}, []);

	return (
		<BaseScreen selected='sgfs'>
			<h1>Games</h1>
			{!games && <h2>No games found</h2>}
			{games?.map((game, index) => <Fragment>
				{index > 0 && <hr />}
				<GameInfo game={game} index={index} onDelete={onDelete} settings={settings} />
			</Fragment>)}
		</BaseScreen>
	);
};

function GameInfo(props: {game: Game, index: number, onDelete: (g: Game) => void, settings: Settings}) {
	return <Fragment>
		<Link href={`/play/${props.index}`}>
			<GameDesc game={props.game} date event result />
			{(props.settings.millestones||[]).map(milestone => <Milestone game={props.game} milestone={milestone} />)}
			{/* {props.game?.milestones?.map((m, index) => <Fragment>
				{index > 0 && <Fragment>&middot;</Fragment>}
				{m.milestone} moves: {m.percentage}%
			</Fragment>)} */}
		</Link>
		<br/>
		<button onClick={() => props.onDelete(props.game)}>Delete?</button>
	</Fragment>
}

function Milestone(props: {milestone: number, game: Game}) {
	const scoreCount = getBestMilestoneScore(props.milestone, props.game);
	if (scoreCount.count == 0) {
		return null;
	}
	return <small><br/>{props.milestone} moves best score <strong>{scoreCount.score}%</strong> (after {scoreCount.count} tries)</small>
}

// function Milestones(props: {milestones: MilestoneScore[]}) {
// 	if (!props.milestones) {
// 		return null;
// 	}
// 	const milestones: number[] = [];
// 	for (const score of props.milestones) {
// 		if (milestones.indexOf(score))
// 	}
// }