import { Observable } from "../utils/observable";
import { Game, Settings } from "../models";
import { API_SERVICE } from "./APIService";
import { SingleEntityStorage, Storage } from "./storage";

class ApplicationService {

	initialized = new Observable<boolean>(false);

	lastSyncAll = 0;

	public GAMES_STORAGE = new Storage<Game>("games");
	public SETTINGS_STORAGE = new SingleEntityStorage<Settings>("settings", new Settings());

	constructor() {
		setTimeout(async () => {
			try {
				await API_SERVICE.checkLoggedIn();
				await this.sync();
			} catch (e) {
				console.error("Error syncing", e);
			}
			setTimeout(() => {
				this.initialized.set(true);
			}, 1)
		}, 1);
	}



	async sync() {
		// prvi put mora biti odrađeno bez čekanja za logged in, inače stranica dobije stariju verziju (sync se izvrši kasnije)
		if (!API_SERVICE.loggedIn.get()) {
			console.log("Not logged in => nothing to do");
			return;
		}
		const fromLastSyncAll = Date.now() - this.lastSyncAll;
		const syncAll = fromLastSyncAll > 4 * 60 * 1000;
		console.log("Syncing all", syncAll);
		for (const storage of Object.values(this)) {
			// TODO Lock
			if (storage instanceof Storage) {
				console.log("Syncing", storage.name());
				try {
					await storage.sync(syncAll);
				} catch (e) {
					console.error("Error syncing", storage.name(), e);
				}
			}
			if (storage instanceof SingleEntityStorage) {
				try {
					await storage.storage.sync(syncAll);
				} catch (e) {
					console.error("Error syncing", storage.storage.name(), e);
				}
			}
			// TODO Unlock
		}
		this.lastSyncAll = Date.now();
	}
}

export const APPLICATION_SERVICE = new ApplicationService();