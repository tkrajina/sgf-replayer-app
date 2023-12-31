import { Fragment, h } from 'preact';
import { Route, Router, route } from 'preact-router';
import Info from '../routes/about';
import AddSGF from '../routes/add';
import { useEffect, useState } from 'preact/hooks';
import { SettingsPage } from '../routes/settings/SettingsPage';
import { PlayPage } from '../routes/play/PlayPage';
import { GamesPage } from '../routes/games/GamesPage';
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

return <Fragment>
	<Router>
		<Route path={"/"} component={GamesPage} />
		<Route path={"/edit"} component={AddSGF} />
		<Route path={"/play/:index"} component={PlayPage} />
		<Route path={"/play"} component={PlayPage} />
		<Route path={"/settings"} component={SettingsPage} />
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
