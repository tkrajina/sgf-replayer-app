import { Observable } from "./observable";

function loadFromLocalStorage(key: string) {
  const val = localStorage.getItem(key);
  if (val == null) {
    return null;
  }
  return JSON.parse(val);
}

export class LocalStoragePersistedObservable<T extends any> extends Observable<T> {

  constructor(private readonly key: string, initVal: T) {
    super(loadFromLocalStorage(key) || initVal);
  }

  set(val: T) {
    super.set(val);
    localStorage.setItem(this.key, JSON.stringify(val));
  }

  delete() {
    localStorage.removeItem(this.key);
  }
}
