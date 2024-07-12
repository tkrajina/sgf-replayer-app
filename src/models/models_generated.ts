
export enum API_SyncActionType {
    SAVE = "s",
    DELETE = "d",
}
export class API_SyncAction {
    type: API_SyncActionType;
    key: string;
    entity: any;

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.type = source["type"];
        this.key = source["key"];
        this.entity = source["entity"];
    }
}
export class API_User {
    id: string;

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.id = source["id"];
    }
}