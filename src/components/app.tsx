import { Fragment, h } from 'preact';
import { Route, Router } from 'preact-router';
import AddSGF from '../routes/AddSGFPage';
import Info from '../routes/ApboutPage';
import GamesPage from '../routes/GamesPage';
import LoginPage from '../routes/LoginPage';
import PlayPage from '../routes/PlayPage';
import SettingsPage from '../routes/SettingsPage';
import { STORAGE_SERVICE } from '../services/storage';
import { Observable } from '../utils/observable';

export const deferredPrompt = new Observable<Event | undefined>(undefined);
let type : "browser" | "standalone";
if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
	console.log('Running in standalone mode');
	type = "standalone";
} else {
	console.log('Running in a browser context');
	type = "browser";
	window.addEventListener('beforeinstallprompt', (e: Event) => {
		// console.log("prevent info-minibar and use own installation");
		// e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
		// Stash the event so it can be triggered later.
		deferredPrompt.set(e)
	});
}

export function install() {
	const dp = deferredPrompt.get();
	if (dp) {
		(dp as any).prompt();
		deferredPrompt.set(undefined);
	} else {
	}
}

const App = () => {

	const onchange = async () => {
		console.log("onchange => sync");
		try {
			await STORAGE_SERVICE.sync();
		} catch (e) {
			console.error("Sync failed", e);
		}
	}

	return <Fragment>
		<Router onChange={onchange}>
			<Route path={"/"} component={GamesPage} />
			<Route path={"/edit"} component={AddSGF} />
			<Route path={"/play/:id"} component={PlayPage} />
			<Route path={"/play"} component={PlayPage} />
			<Route path={"/settings"} component={SettingsPage} />
			<Route path={"/login"} component={LoginPage} />
			{/* <Route path={"/stats"} component={Stats} /> */}
			<Route path={"/info"} component={Info} />
			<Route default component={NotFound} />
		</Router>
	</Fragment>;
}

function NotFound() {
	if (document.location.toString().indexOf("/404") < 0) {
		document.location.replace("/404")
	}
	return <h1>Not found</h1>;
}

export default App;
