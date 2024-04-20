import { Fragment, h } from 'preact';

export function Heatmap(props: {moveCount: number, triesCounts: number[]}) {
	return <div style={{width: "100%", height: "10px", display: "flex", flexDirection: "row", border: "1px solid gray"}}>
		{Array.from(Array(props.moveCount || 0)).map((_, index) => <div style={{flexGrow: 1, backgroundColor: color(props.triesCounts?.[index]) || "undefined"}}></div>)}
	</div>
}

const retryCountColor = {
	"0": "#00ff00",
	"1": "#00cc00",
	"2": "#009900",
	"3": "#005500",
}

function color(retryCount: number) {
	if (retryCount === undefined) {
		return null;
	}
	return retryCountColor[retryCount] || null;
}
