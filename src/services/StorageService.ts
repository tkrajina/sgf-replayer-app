import { generateRandomAlphanumeric } from "src/utils/strings";

export const GAMES = "sgf_replay_games";
export const SETTINGS = "sgf_replay_settings";

interface Entity {
	id: string;
	createdAt: number;
	updatedAt: number;
}

class StorageAction<T extends Entity> {
	type: "save" | "delete";
	id: string;
	entity: T;
}

class Storage<T extends Entity> {

	actionQueue: {[key: string]: StorageAction<T>} = {};

	constructor(private readonly key: string) {}

	private all(): {[key: string]: T} {
		return (JSON.parse(localStorage.getItem(this.key)) || {});
	}

	private saveAll(all: {[key: string]: T}) {
		localStorage.setItem(this.key, JSON.stringify(all));
	}

	listAll(): T[] {
		const res: T[] = [];
		const all = this.all();
		for (const id in Object.keys) {
			res.push(all[id]);
		}
		return res;
	}

	byId(id: string): T {
		return this.all()[id];
	}

	generateIdIfNeeded(entity: T) {
		if (!entity?.id) {
			entity.id = generateRandomAlphanumeric(10);
		}
	}

	update(entity: T) {
		if (!entity?.id) {
			entity.createdAt = Date.now();
		}
		entity.updatedAt = Date.now();
		this.generateIdIfNeeded(entity);
		const all = this.all();
		all[entity.id] = entity;
		this.saveAll(all);
		this.actionQueue[entity.id] = {type: "save", id: entity.id, entity};
	}

	delete(entity: T) {
		const all = this.all();
		delete all[entity.id];
		this.saveAll(all);
		this.actionQueue[entity.id] = {type: "delete", id: entity.id, entity};
	}
}

class SingleEntityStorage<T extends Entity> {

	static ENTITY_KEY = "entity";

	storage: Storage<T>;

	constructor(private readonly key: string, initialValue: T) {
		this.storage = new Storage<T>(this.key);
		if (!this.storage.byId(SingleEntityStorage.ENTITY_KEY)) {
			this.set(initialValue);
		}
	}

	get(): T {
		return this.storage.byId(SingleEntityStorage.ENTITY_KEY) as T;
	}

	set(t: T) {
		this.storage.update(t);
	}
}