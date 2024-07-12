import { generateRandomAlphanumeric } from "../utils/strings";

interface Entity {
	id: string;
	createdAt: number;
	updatedAt: number;
}

class StorageAction<T extends Entity> {
	id: string;
}

export class Storage<T extends Entity> {

	private readonly syncActionQueueKey;

	constructor(private readonly key: string) {
		this.syncActionQueueKey = `__sync_entity_updated_${key}`;
	}

	private all(): {[key: string]: T} {
		return (JSON.parse(localStorage.getItem(this.key)) || {});
	}

	private markEntityUpdated(a: StorageAction<T>) {
		const queue = JSON.parse(localStorage.getItem(this.syncActionQueueKey) || "{}");
		queue[a.id] = Date.now();
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