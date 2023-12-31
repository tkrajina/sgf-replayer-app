import { Fragment, h } from 'preact';
import { BaseScreen } from '../../components/BaseScreen';

const Stats = (props: {textNo: string}) => {
	return (
		<BaseScreen selected='stats'>
			<h1>Stats</h1>
		</BaseScreen>
	);
};

export default Stats;
