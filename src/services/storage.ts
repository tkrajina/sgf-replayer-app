import { Game, Settings } from "../models";
import { SingleEntityStorage, Storage } from "./StorageService";

export const GAMES_STORAGE = new Storage<Game>("games");
export const SETTINGS_STORAGE = new SingleEntityStorage<Settings>("settings", new Settings());