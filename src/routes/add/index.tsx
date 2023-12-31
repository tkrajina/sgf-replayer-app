import { Fragment, h } from 'preact';
import { route } from 'preact-router';
import { TargetedEvent } from 'preact/compat';
import { useCallback } from 'preact/hooks';
import { gamesService } from '../../services/GamesService';
import { BaseScreen } from '../../components/BaseScreen';

const AddSGF = () => {

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
    }, []);


	return (
		<BaseScreen selected='new'>
			<h1>Add new game</h1>
			<p>
				Select SGF file: <input type="file" name="myFile" onChange={uploadFile} accept=".sgf" />
			</p>
		</BaseScreen>
	);
};

export default AddSGF;