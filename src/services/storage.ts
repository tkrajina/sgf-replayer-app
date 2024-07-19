import { Game, Settings } from "../models";
import { API_SERVICE } from "./APIService";
import { SingleEntityStorage, Storage } from "./StorageService";

class StorageService {
	public GAMES_STORAGE = new Storage<Game>("games");
	public SETTINGS_STORAGE = new SingleEntityStorage<Settings>("settings", new Settings());

	constructor() {
		API_SERVICE.loggedIn.addListener(async () => {
			if (API_SERVICE.loggedIn.get()) {
				console.log("logged in => retrieve");
				await this.retrieve();
			}
		});
	}

	async retrieve() {
		if (!API_SERVICE.loggedIn.get()) {
			console.log("Not logged in => nothing to do");
			return;
		}
		for (const storage of Object.values(this)) {
			// TODO Lock
			if (storage instanceof Storage) {
				console.log("Syncing", storage.name());
				try {
					await storage.retrieve();
				} catch (e) {
					console.error("Error syncing", storage.name(), e);
				}
			}
			if (storage instanceof SingleEntityStorage) {
				try {
					await storage.storage.retrieve();
				} catch (e) {
					console.error("Error syncing", storage.storage.name(), e);
				}
			}
			// TODO Unlock
		}
	}

	async sync() {
		if (!API_SERVICE.loggedIn.get()) {
			console.log("Not logged in => nothing to do");
			return;
		}
		for (const storage of Object.values(this)) {
			// TODO Lock
			if (storage instanceof Storage) {
				console.log("Syncing", storage.name());
				try {
					await storage.sync();
				} catch (e) {
					console.error("Error syncing", storage.name(), e);
				}
			}
			if (storage instanceof SingleEntityStorage) {
				try {
					await storage.storage.sync();
				} catch (e) {
					console.error("Error syncing", storage.storage.name(), e);
				}
			}
			// TODO Unlock
		}
	}
}

export const STORAGE_SERVICE = new StorageService();