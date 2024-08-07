import { Fragment, h } from 'preact';
import { route } from 'preact-router';
import { TargetedEvent } from 'preact/compat';
import { useCallback } from 'preact/hooks';
import { gamesService } from '../services/GamesService';
import { BaseScreen } from '../components/BaseScreen';
import { API_SERVICE } from '../services/APIService';
import { API_Game } from '../models/models_generated';
import { useStateRef } from '../utils/hooks';

const AddSGF = () => {
	const games = useStateRef<API_Game[] | undefined>(undefined)
	const searchString = useStateRef<string>("")

	const uploadFile = useCallback(async (event: TargetedEvent<HTMLInputElement>) => {
		event.preventDefault();
		let file = event.currentTarget.files[0];
		try {
			const sgf = await file.text() as string;
			console.log(sgf)
			try {
				gamesService.saveSGFCollection(sgf)
			} catch (e) {
				console.error(e);
				alert("Invalid SGF file")
				return;
			}
			alert("Imported");
			const url = `/`;
			route(url, true);
		} catch (e) {
			alert("Error importing: " + e);
		}
    }, [])

	const search = async () => {
		try {
			games.set(await API_SERVICE.doGET("/games", {"search": searchString.get()}) as API_Game[]);
		} catch (e) {
			alert(e);
		}
	}

	return (
		<BaseScreen selected='new'>
			<h2>Add new game</h2>
			<p>
				Select SGF file: <input type="file" name="myFile" onChange={uploadFile} accept=".sgf" />
			</p>
			<hr />
			<h2>...or import from our collection</h2>
			<input type="text" placeholder="Search" value={searchString.get()} onChange={e => searchString.set(e.currentTarget.value)}/>
			<button onClick={search}>Search</button>
			<ul>
				{games.get() && games.get().map(game => <li>{JSON.stringify(game)}</li>)}
			</ul>
		</BaseScreen>
	);
};

export default AddSGF;