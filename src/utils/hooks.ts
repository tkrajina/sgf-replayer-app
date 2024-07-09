import { useRef, useState } from "react";

interface Value<T> {
  value: T;
}

class StateVar<T> {

  private val: Value<T>;
  private loaded = false;

  constructor(private loader: () => T, private stateSetter: (t: Value<T>) => void) {
    this.val = {value: undefined as T};
  }

  private load() {
    if (this.loaded) {
      return;
    }
    this.val = { value: this.loader() };
    this.loaded = true;
  }

  get(): T {
    this.load();
    return this.val.value;
  }
  set(t: T) {
    this.loaded = true;
    const newVal = {value: t}; // Always a new object => it means every .set() triggers a re-render.
    this.stateSetter(newVal);
    this.val = newVal;
  }
  with(doStuff: (t: T) => T) {
    this.set(doStuff(this.get()));
  }
  withObject(doStuff: (t: T) => void) {
    const val = this.get();
    doStuff(val);
    this.set(val);
  }

  reload() {
    this.set(this.get());
  }
}

export function useStateRef<T>(initVal: T | (() => T)): StateVar<T> {
  const [state, setState] = useState<Value<T>>({value: undefined as T});
  const ref = useRef(new StateVar((initVal as any)?.call ? (initVal as (() => T)): () => initVal as T, setState));
  return ref.current;
}

export function assignTypesafe<T>(dest: StateVar<T>, fields: Partial<T>) {
  const value = dest.get();
  for (const key of Object.keys(fields)) {
    (value as any)[key] = (fields as any)[key];
  }
  dest.set(value);
}