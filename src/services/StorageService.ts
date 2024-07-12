import { API_SyncAction, API_SyncActionType } from "../models/models_generated";
import { generateRandomAlphanumeric } from "../utils/strings";
import { API_SERVICE } from "./APIService";

interface Entity {
	id: string;
	createdAt: number;
	updatedAt: number;
}

export class Storage<T extends Entity> {

	private readonly syncActionQueueKey;

	constructor(private readonly key: string) {
		this.syncActionQueueKey = `__sync_entity_updated_${key}`;
	}

	async sync() {
		try {
			const updates = JSON.parse(localStorage.getItem(this.syncActionQueueKey) || "{}");
			// Empty and save immediately
			if (!updates?.length) {
				return;
			}
			const all = this.all();
			const actions: API_SyncAction[] = [];
			for (const key of Object.keys(updates)) {
				if (key in all) {
					actions.push({
						type: API_SyncActionType.SAVE,
						key: key,
						entity: all[key],
					} as API_SyncAction);
				} else {
					actions.push({
						type: API_SyncActionType.DELETE,
						key: key,
					} as API_SyncAction);
				}
			}

			// TODO: lock
			let newEntities = (await API_SERVICE.doPOST(`/entity/${this.key}`, actions)) as T[];
			if (!newEntities) {
				newEntities = [];
			}

			const storage = {};
			for (const e of newEntities) {
				storage[e.id] = e;
			}

			localStorage.setItem(this.syncActionQueueKey, "{}");
			localStorage.setItem(this.key, JSON.stringify(storage));
			// TODO: unlock
		} catch (e) {
			alert(e); // TODO
		}
	}

	private all(): {[key: string]: T} {
		return (JSON.parse(localStorage.getItem(this.key)) || {});
	}

	private markEntityUpdated(e: T) {
		const queue = JSON.parse(localStorage.getItem(this.syncActionQueueKey) || "{}");
		queue[e.id] = Date.now();
		localStorage.setItem(this.syncActionQueueKey, JSON.stringify(queue));
	}

	private saveAll(all: {[key: string]: T}) {
		localStorage.setItem(this.key, JSON.stringify(all));
	}

	listAll(): T[] {
		const res: T[] = [];
		const all = this.all();
		for (const id of Object.keys(all)) {
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

	save(entity: T) {
		if (!entity?.id) {
			entity.createdAt = Date.now();
		}
		entity.updatedAt = Date.now();
		this.generateIdIfNeeded(entity);
		const all = this.all();
		all[entity.id] = entity;
		this.saveAll(all);
		this.markEntityUpdated(entity);
	}

	delete(entity: T) {
		const all = this.all();
		delete all[entity.id];
		this.saveAll(all);
		this.markEntityUpdated(entity);
	}
}

export class SingleEntityStorage<T extends Entity> {

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
		t.id = SingleEntityStorage.ENTITY_KEY;
		this.storage.save(t);
	}
}