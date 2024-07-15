import { Game, Settings } from "../models";
import { SingleEntityStorage, Storage } from "./StorageService";

class StorageService {
	public GAMES_STORAGE = new Storage<Game>("games");
	public SETTINGS_STORAGE = new SingleEntityStorage<Settings>("settings", new Settings());


	constructor() {
	}

	async sync() {
		for (const storage of Object.values(this)) {
			// TODO Lock
			if (storage instanceof Storage) {
				console.log("Syncing", storage.name());
				await storage.sync();
			}
			if (storage instanceof SingleEntityStorage) {
				await storage.storage.sync();
			}
			// TODO Unlock
		}
	}
}

export const STORAGE_SERVICE = new StorageService();