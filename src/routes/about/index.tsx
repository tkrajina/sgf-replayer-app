import { Fragment, h } from 'preact';
import { BaseScreen } from '../../components/BaseScreen';

const Info = () => {
	return (
		<BaseScreen selected='info'>
			<h1>About</h1>
			<p>
				This application is open source...
			</p>
		</BaseScreen>
	);
};

export default Info;