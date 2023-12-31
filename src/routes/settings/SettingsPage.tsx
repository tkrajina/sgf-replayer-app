import { Fragment, h } from 'preact';
import { TargetedEvent } from 'preact/compat';
import { useCallback, useState } from 'preact/hooks';
import { BaseScreen } from '../../components/BaseScreen';
import { GAMES, SETTINGS, gamesService } from '../../services/GamesService';

export const SettingsPage = (props: {}) => {
	let [settings, setSettings] = useState(gamesService.loadSettings());
	let [exportJSON, setExportJSON] = useState(undefined as any);

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
		gamesService.saveSettings(settings);
		alert("Saved");
	}

	const onExport = useCallback(() => {
		const jsn = {};
		for (const key of [GAMES, SETTINGS]) {
			jsn[key] = JSON.parse(localStorage.getItem(key));
		}
		setExportJSON(jsn);
	}, []);
	const uploadFile = useCallback(async (event: TargetedEvent<HTMLInputElement>) => {
		event.preventDefault();
		if (window.confirm("Import data. This will overwrite all existing data, continue?")) {
			let file = event.currentTarget.files[0];
			try {
				const str = await file.text();
				const json = JSON.parse(str);
				for (const key of Object.keys(json)) {
					localStorage.setItem(key, JSON.stringify(json[key]));
				}
			} catch (e) {
				alert("Error importing: " + e);
			}
		}
    }, []);


	return (
		<BaseScreen selected='settings'>
			<h1>Settings</h1>
			<p>
				{!exportJSON && <Fragment>
					<button onClick={onExport}>Export / import</button>
				</Fragment>}
				{!!exportJSON && <Fragment>
					<ul>
						<li> <a download="sgf-replay-expport.json" href={"data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(exportJSON))}>Export all data</a>?</li>
						<li> Umport all data: <input type="file" accept=".json" name="myFile" onChange={uploadFile} />	</li>
					</ul>
					<hr/>
				</Fragment>}
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