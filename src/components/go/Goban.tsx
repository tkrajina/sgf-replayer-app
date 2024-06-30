import { Fragment, h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { SGFGoban } from '../../sgf/goban';
import { SGFColor, coordinateToRowColumn, rowColumnToCoordinate } from '../../sgf/sgf';

interface GobanProps {
	size: number;
	width?: number;
	unit?: string;
	goban: SGFGoban;
	emptyIntersections?: number[];
	invalidIntersections?: number[][];
	onClick?: (row: number, col: number) => void;
	markLastMove?: boolean;
}

export function Goban(props: GobanProps) {
	const playableRef = useRef<HTMLDivElement>();
	const side = props.width || 100;
	const emptyBorder = .5 * props.width / props.size;
	const playableSide = side - emptyBorder;
	const bandWidth = playableSide / props.size;
	const unit = props.unit || "vmin";
	const [tmpStone, setTmpStone] = useState(undefined as undefined | [number, number]);
	const goban = useRef(props.goban);
	if (goban.current != props.goban) {
		setTmpStone(undefined);
	}

	const getRowCol = (e: MouseEvent) => {
		const rect = playableRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left; //x position within the element.
		const y = e.clientY - rect.top;  //y position within the element.
		const row = Math.floor(props.size * y / rect.height);
		const col = Math.floor(props.size * x / rect.width);
		return [row, col];
	}

	const logCoordinates = (e: MouseEvent) => {
		e.preventDefault();
		let [row, col] = getRowCol(e);
		// console.log(`client: ${e.clientX},${e.clientY}, rect: ${rect.left},${rect.top} => ${x},${y} => ${x / rect.width},${y / rect.height} => ${row},${col}`)
		console.log(`Setting stone at ${row},${col}`)
		if (props.goban.isStoneAt(rowColumnToCoordinate([row, col]))) {
			setTmpStone(undefined);
		} else {
			setTmpStone([row, col]);
		}
	}

	const onClick = (e: MouseEvent) => {
		e.preventDefault();
		let [row, col] = getRowCol(e);
		props?.onClick(row, col);
		setTmpStone(undefined);
	}

	const clearTmpStone = (e: MouseEvent) => {
		e.preventDefault();
		console.log("Clearing stone?")
		console.log(e.relatedTarget)
		if (e.relatedTarget != playableRef.current) {
			console.log("Clearing stone!")
			setTmpStone(undefined);
		}
	}

	let nextColor: string;
	if (props.goban.nextToPlay == SGFColor.WHITE) {
		nextColor = "white";
	} else if (props.goban.nextToPlay == SGFColor.BLACK) {
		nextColor = "black";
	}

	return <div style={{width: `${side}${unit}`, height: `${side}${unit}`, backgroundColor: "orange", position: "relative", margin: "0 auto 0 auto"}}>
		<div ref={playableRef} id="goban" style={{position: "absolute", top: `${emptyBorder / 2}${unit}`, left: `${emptyBorder / 2}${unit}`, width: `${playableSide}${unit}`, height: `${playableSide}${unit}`}} onMouseMove={logCoordinates} onClick={logCoordinates} onMouseLeave={clearTmpStone} onMouseUp={onClick}>
			<Hoshi bandWidth={bandWidth} goban={props.goban} unit={props.unit} />
			{Array.from(Array(props.size)).map((_, index) => <Fragment>
				<div style={{position: "absolute", height: `${playableSide - bandWidth}${unit}`, width: "0.5px", color: "black", top: `${bandWidth / 2}${unit}`, left: `${playableSide * index / props.size + bandWidth / 2.}${unit}`, backgroundColor: "black"}} />
				<div style={{position: "absolute", width: `${playableSide - bandWidth}${unit}`, height: "0.5px", color: "black", left: `${bandWidth / 2}${unit}`, top: `${playableSide * index / props.size + bandWidth / 2.}${unit}`, backgroundColor: "black"}} />
			</Fragment>)}
			{props.goban.goban.map((row, rowNo) => row.map((color, columnNo) => {
				switch (color) {
					case SGFColor.BLACK:
						return <Stone row={rowNo} column={columnNo} bandWidth={bandWidth} unit={unit} color={"black"}/>
					case SGFColor.WHITE:
						return <Stone row={rowNo} column={columnNo} bandWidth={bandWidth} unit={unit} color={"white"}/>
				}
			}
			))}
			{(props.markLastMove && props.goban.latestMove) && 
				<IntersectionDot radious={bandWidth / 3} row={coordinateToRowColumn(props.goban.latestMove)?.[0]} column={coordinateToRowColumn(props.goban.latestMove)?.[1]} color={props.goban.stoneAt(props.goban.latestMove) == SGFColor.BLACK ? "white" : "black"} bandWidth={bandWidth} unit={unit} />}
			{props.goban.labels && Object.keys(props.goban.labels)?.map(coordinate => {
				const rowCol = coordinateToRowColumn(coordinate)
				return <Label row={rowCol[0]} column={rowCol[1]} color={props.goban.stoneAt(coordinate) == SGFColor.BLACK ? "white" : "black"} bandWidth={bandWidth} unit={unit} label={props.goban.labels[coordinate]} />}
			)}
			{props.goban.triangles && Object.keys(props.goban.triangles)?.map(coordinate => {
				const rowCol = coordinateToRowColumn(coordinate)
				return <Label row={rowCol[0]} column={rowCol[1]} color={props.goban.stoneAt(coordinate) == SGFColor.BLACK ? "white" : "black"} bandWidth={bandWidth} unit={unit} label="△" />}
			)}
			{props.goban.squares && Object.keys(props.goban.squares)?.map(coordinate => {
				const rowCol = coordinateToRowColumn(coordinate)
				return <Label row={rowCol[0]} column={rowCol[1]} color={props.goban.stoneAt(coordinate) == SGFColor.BLACK ? "white" : "black"} bandWidth={bandWidth} unit={unit} label="□" />}
			)}
			{props.goban.crosses && Object.keys(props.goban.crosses)?.map(coordinate => {
				const rowCol = coordinateToRowColumn(coordinate)
				return <Label row={rowCol[0]} column={rowCol[1]} color={props.goban.stoneAt(coordinate) == SGFColor.BLACK ? "white" : "black"} bandWidth={bandWidth} unit={unit} label="×" />}
			)}
			{props.goban.circles && Object.keys(props.goban.circles)?.map(coordinate => {
				const rowCol = coordinateToRowColumn(coordinate)
				return <Label row={rowCol[0]} column={rowCol[1]} color={props.goban.stoneAt(coordinate) == SGFColor.BLACK ? "white" : "black"} bandWidth={bandWidth} unit={unit} label="○" />}
			)}
			{!!(tmpStone && nextColor) && <Stone row={tmpStone[0]} column={tmpStone[1]} color={nextColor} bandWidth={bandWidth} unit={unit} opacity={0.25} />}
			{props.emptyIntersections && <EmptyIntersections bandWidth={bandWidth} margins={props.emptyIntersections} goban={props.goban} unit={props.unit} />}
			{props.invalidIntersections?.map((coords) => <IntersectionDot row={coords[0]} column={coords[1]} bandWidth={bandWidth} unit={props.unit} radious={coords[2] ? bandWidth * coords[2] : (bandWidth / 3)} opacity={0.25} color="gray" />)}
		</div>
	</div>
}

function EmptyIntersections(props: {margins?: number[], goban: SGFGoban, bandWidth: number, unit: string, color?: string}) {
	if (!props.margins) {
		return null;
	}
	let [top, right, bottom, left] = props.margins;
	console.log(`${top} ${right} ${bottom} ${left}`)
	if (top + bottom >= props.goban.size) {
		return null;
	}
	if (left + right >= props.goban.size) {
		return null;
	}
	return <Fragment>
		{Array(props.goban.size).fill(undefined).map((_, row) => Array(props.goban.size).fill(undefined).map((_, col) => {
			if (col >= left && col < props.goban.size - right && row >= top && row < props.goban.size - bottom) {
				const stone = props.goban.stoneAt(rowColumnToCoordinate([row, col]));
				if (stone != SGFColor.BLACK && stone != SGFColor.WHITE) {
					return <IntersectionDot row={row} column={col} bandWidth={props.bandWidth} unit={props.unit} radious={props.bandWidth / 3} opacity={0.25} color={props.color} />
				}
				return null;
			}
		}))}
	</Fragment>
}

function Hoshi(props: {goban: SGFGoban, bandWidth: number, unit: string}) {
		let hoshiPositions: [number, number][]  = [];
		switch (props.goban.size) {
			case 19:
				hoshiPositions  = [
					[3, 3], [3, 9], [3, 15],
					[9, 3], [9, 9], [9, 15],
					[15, 3], [15, 9], [15, 15],
				];
				break;
			case 13:
				hoshiPositions  = [
					[3, 3], [3, 9],
					[6, 6],
					[9, 3], [9, 9],
				];
				break;
			case 9:
				hoshiPositions  = [
					[2, 2], [2, 6],
					[6, 2], [6, 6],
				];
				break;
		}
	return <Fragment>
		{hoshiPositions.map((element) => <IntersectionDot row={element[0]} column={element[1]} bandWidth={props.bandWidth} unit={props.unit} radious={props.bandWidth / 5} opacity={1} />)}
	</Fragment>
}

function IntersectionDot(props: {row: number, column: number, bandWidth: number, unit: string, radious: number, opacity?: number, color?: string}) {
	return <div style={{justifyContent: "center", alignContent: "center", display: "flex", flexDirection: "row", position: "absolute", width: `${props.bandWidth}${props.unit}`, height: `${props.bandWidth}${props.unit}`, top: `${props.row * props.bandWidth}${props.unit}`, left: `${props.column * props.bandWidth}${props.unit}`}}>
		<div style={{opacity: props.opacity ? props.opacity : 1, backgroundColor: props.color ? props.color : "black", borderRadius: `${props.radious}${props.unit}`, alignSelf: "center", justifySelf: "center", justifyContent: "center", width: `${props.radious}${props.unit}`, height: `${props.radious}${props.unit}` }}>
		</div>
	</div>
}

function Label(props: {row: number, column: number, bandWidth: number, unit: string, color: string, label: string}) {
	return <div style={{display: "flex", flexDirection: "row", position: "absolute", width: `${props.bandWidth}${props.unit}`, height: `${props.bandWidth}${props.unit}`, top: `${props.row * props.bandWidth}${props.unit}`, left: `${props.column * props.bandWidth}${props.unit}`}}>
		<div style={{color: props.color, display: "flex", alignSelf: "center", justifySelf: "center", textAlign: "center", flexGrow: 1, justifyContent: "center", fontSize: `${props.bandWidth * 0.9}${props.unit}`}}>
			{props.label}
		</div>
	</div>
}

function Stone(props: {row: number, column: number, bandWidth: number, unit: string, color: string, opacity?: number}) {
	return <div style={{display: "flex", justifyContent: "center", alignContent: "center", opacity: props?.opacity ? props.opacity : undefined, position: "absolute", borderRadius: `${props.bandWidth / 1}${props.unit}`, backgroundColor: props.color, width: `${props.bandWidth}${props.unit}`, height: `${props.bandWidth}${props.unit}`, top: `${props.row * props.bandWidth}${props.unit}`, left: `${props.column * props.bandWidth}${props.unit}`}}>
	</div>
}