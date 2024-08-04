import { Fragment, h } from 'preact';
import { TargetedEvent } from 'preact/compat';
import { useState } from 'preact/hooks';
import { APPLICATION_SERVICE } from '../services/ApplicationService';
import { BaseScreen } from '../components/BaseScreen';
import { Link } from 'preact-router';

const SettingsPage = (props: {}) => {
	let [settings, setSettings] = useState(APPLICATION_SERVICE.SETTINGS_STORAGE.get());

	const setMillestones = (e: TargetedEvent<HTMLInputElement>) => {
		const str = e.currentTarget.value;
		const milestones = (str || "").split(",").map(txt => parseInt(txt.trim())).filter(e => !isNaN(e)).map(Math.abs);
		setSettings(s => {
			s.millestones = milestones;
			return s;
		});
	}

	const setMaxTimePerMove = (e: TargetedEvent<HTMLInputElement>) => {
		setSettings(s => {
			s.maxTimePerMove = Math.abs(parseInt(e.currentTarget.value.trim()));
			return s;
		});
	}

	const setMaxTriesPerMove = (e: TargetedEvent<HTMLInputElement>) => {
		setSettings(s => {
			s.maxTriesPerMove = Math.abs(parseInt(e.currentTarget.value.trim()));
			return s;
		});
	}

	const onSave = () => {
		APPLICATION_SERVICE.SETTINGS_STORAGE.set(settings);
		alert("Saved");
	}

	return (
		<BaseScreen selected='settings'>
			<h1>Settings</h1>
			<p>
				<Link href="/login">Login</Link>
			</p>
			<p>
				Millestones:<br/>
				<input type="text" value={(settings.millestones || []).join(",")} onChange={setMillestones} />
			</p>
			<p>
				Max tries per move:<br/>
				<input type="text" value={settings.maxTriesPerMove} onChange={setMaxTriesPerMove} />
			</p>
			<p>
				Max time per move (in seconds):<br/>
				<input type="text" value={settings.maxTimePerMove} onChange={setMaxTimePerMove} />
			</p>
			<button onClick={onSave}>Save</button>
		</BaseScreen>
	);
};

export default SettingsPage;