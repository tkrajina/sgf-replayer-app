import { Fragment, h } from 'preact';
import { Link } from 'preact-router';
import { useEffect, useRef, useState } from 'preact/hooks';
import { BaseScreen } from '../components/BaseScreen';
import { GameDesc } from '../components/GameDesc';
import { Goban } from '../components/go/Goban';
import { Game, MilestoneScore } from '../models';
import { gamesService } from '../services/GamesService';
import { SGFGoban } from '../sgf/goban';
import { parseSGF } from '../sgf/parser';
import { coordinateToRowColumn } from '../sgf/sgf';
import { Heatmap } from '../components/go/Heatmap';
import { APPLICATION_SERVICE } from '../services/ApplicationService';

type GobanWidths = 33 | 66 | 100;

const PlayPage = (props: {id: string}) => {
	const settings = APPLICATION_SERVICE.SETTINGS_STORAGE.get();

	const gameId = props.id;
	const [game, setGame] = useState(gamesService.loadGame(gameId));
	let rootNode = useRef(parseSGF(game.sgf));
	useEffect(() => {
		gamesService.reloadGame(game, rootNode.current);
	}, []);
	let currentNode = useRef(rootNode.current);

	useEffect(() => {
		setGame(game => {
			game.currentTriesCount = game.currentTriesCount || [];
			const no = game.currentMoveNumber;
			for (let i = 0; i < no; i++) {
				console.log(`${i} <= ${game.currentMoveNumber}`);
				onNext();
			}
			gamesService.saveGame(game);
			return game;
		})
	}, []);


	let [divWidth, setDivWidth] = useState((settings.gobanWidth || 100) as GobanWidths);
	let [goban, setGoban] = useState(() => {
		const res = new SGFGoban()
		res.apply(rootNode.current);
		return res;
	});

	const tryCount = useRef(0)
	let [emptyIntersesections, setEmptyIntersesections] = useState([0, 0, 0, 0]);
	let [invalidIntersections, setInvalidIntersections] = useState([] as number[][]);

	const milestonesReached = useRef<{[milestone: string]: boolean}>({});
	const onMilestoneReached = (milestone: number, percentage: number) => {
		if (!game.milestones) {
			game.milestones = [];
		}
		if (milestonesReached.current?.[milestone]) {
			return;
		}
		milestonesReached.current[milestone] = true;
		game.milestones.push(new MilestoneScore(milestone, percentage, Date.now()));
		gamesService.saveGame(game);
	}

	const onNext = () => {
		const newGoban = new SGFGoban();
		if (!currentNode.current.children?.length) {
			newGoban.apply(currentNode.current);
			return;
		}
		currentNode.current = currentNode.current.children[0];
		const path = rootNode.current.findPath(currentNode.current);
		for (const n of path) {
			newGoban.apply(n);
		}
		setGoban(newGoban);
		setGame(game => {
			game.currentMoveNumber = path.length - 1;
			gamesService.saveGame(game);
			return game;
		})
	};

	const onReset = () => {
		if (!confirm("Are you sure you want to reset the game?")) {
			setGame(game => {
				game.currentMoveNumber = 0;
				game.currentTriesCount = [];
				gamesService.saveGame(game);
				alert("Reset");
				document.location.reload();
				return game;
			})
		}
	}

	// const onPrevious = () => {
	// 	const newGoban = new SGFGoban();
	// 	const path = rootNode.current.findPath(currentNode.current);
	// 	if (path.length <= 1) {
	// 		return;
	// 	}
	// 	path.pop();
	// 	currentNode.current = path[path.length - 1];
	// 	for (const n of path) {
	// 		newGoban.apply(n);
	// 	}
	// 	setGoban(newGoban);
	// 	setMoveNo(path.length - 1);
	// };

	const onClick = (row: number, col: number) => {
		const next = currentNode.current.children[0];
		let [color, coords] = next.playerAndCoordinates();
		let [nextRow, nextCol] = coordinateToRowColumn(coords);
		if ((row == nextRow && col == nextCol) || (tryCount.current >= settings.maxTriesPerMove - 1)) {
			setGame(game => {
				game.currentTriesCount[game.currentMoveNumber] = tryCount.current;
				gamesService.saveGame(game);
				return game;
			})
			tryCount.current = 0;
			setEmptyIntersesections([0, 0, 0, 0]);
			setInvalidIntersections([]);
			onNext();
		} else {
			const distance = Math.sqrt(Math.pow(row - nextRow, 2) + Math.pow(col - nextCol, 2));
			const d = 1 - distance / goban.size
			invalidIntersections.push([row, col, d < .3 ? .3 : d]);
			tryCount.current ++;
			setGame(game => {
				game.currentTriesCount[game.currentMoveNumber] = tryCount.current;
				gamesService.saveGame(game);
				return game;
			})
			const side = goban.size / Math.pow(2, tryCount.current);
			const top = Math.floor(nextRow / side) * side;
			const left = Math.floor(nextCol / side) * side;
			// const next = [
			// 	top,
			// 	goban.size - left - side,
			// 	goban.size - top - side,
			// 	left
			// ]
			// // alert(side + ":" + JSON.stringify(next))
			// setEmptyIntersesections(next);
		}
	}

	useEffect(() => {
		const keyListener = (event: KeyboardEvent) => {
			switch (event.code) {
				case "ArrowRight":
					onNext();
					break;
				// case "ArrowLeft":
				// 	onPrevious();
				// 	break;
			}
			console.log(event.code)
		}
		document.addEventListener('keydown', keyListener);
	}, []);

	const onGobanSizeUpdate = (size: GobanWidths) => {
		setDivWidth(size);
		settings.gobanWidth = size;
		APPLICATION_SERVICE.SETTINGS_STORAGE.set(settings);
	}

	return (
		<BaseScreen selected='sgfs' noPadding>
			<div style={{width: `${divWidth}vmin`, margin: "0 auto 0 auto"}}>
				<Goban size={19} width={divWidth} unit="vmin" goban={goban} emptyIntersections={tryCount.current == 0 ? undefined : emptyIntersesections} invalidIntersections={invalidIntersections} onClick={onClick} markLastMove />
				<div style={{display: "flex", flexDirection: "row"}}>
					<div style={{flexGrow: 1}}>
						<GameDesc game={game} result />
						<br/>
						<small>Move #{game.currentMoveNumber}</small>
					</div>
					<div style={{flexGrow: 1, textAlign: "right"}}>
						<GobanSizeSelect onUpdate={onGobanSizeUpdate} />
					</div>
				</div>
				{/* <button title={"prev"} onClick={onPrevious}>Prev</button>
				<button title={"next"} onClick={onNext}>Next</button> */}
				<br/>
				<Heatmap moveCount={game.movesCount} triesCounts={game.currentTriesCount} />
				{game.currentMoveNumber > 0 && <Fragment>
					<button onClick={onReset}>Reset</button>
					&nbsp;
				</Fragment>}
				<a target="_blank" href={"https://ai-sensei.com/upload?sgf=" + encodeURIComponent(game.sgf)}>Open in AI Sensei</a>&nbsp;
			</div>
		</BaseScreen>
	);
};

export default PlayPage;

function GobanSizeSelect(props: {onUpdate: (width: GobanWidths) => void}) {
	return <Fragment>
		<Link href="javascript:void()" onClick={() => props.onUpdate(33)}><img src={`/assets/logo.svg`} alt="Preact Logo" style={{width: "0.5em"}} /></Link>
		&nbsp;
		<Link href="javascript:void()" onClick={() => props.onUpdate(66)}><img src={`/assets/logo.svg`} alt="Preact Logo" style={{width: "0.75em"}} /></Link>
		&nbsp;
		<Link href="javascript:void()" onClick={() => props.onUpdate(100)}><img src={`/assets/logo.svg`} alt="Preact Logo" style={{width: "1.2em"}} /></Link>
	</Fragment>
}