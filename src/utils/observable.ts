let keyGeneratorCounter = 0;
let observableCounter = 0;
setInterval(() => console.debug("active", observableCounter, "observable listeners"), 60 * 1000);

export class Observable<T extends any> {
  protected _val: T;

  listeners: { [listenerKey: string]: (val: T, prevVal: T) => void } = {};

  constructor(initial: T) {
    this._val = initial;
  }

  get() {
    return this._val;
  }

  set(val: T) {
    const prevVal = this._val;
    this._val = val;
    this.notifyListeners(prevVal);
  }

  /** Do something with value and refresh. */
  updateAndNotifyListeners(something: (val: T) => void) {
    const prevVal = this._val;
    try {
      something(this._val);
    } catch (e) {
      console.error(e);
    } finally {
      this.notifyListeners(prevVal);
    }
  }

  /**
   * Use this explicitly only if the value changed with `this.value.method()`, otherwise it's called every time it changed.
   */
  notifyListeners(prevVal: T) {
    for (const key in this.listeners) {
      this.notifyListener(key, prevVal);
    }
  }

  private async notifyListener(key: string, prevVal: T) {
    const listener = this.listeners[key];
    if (!listener) {
      console.warn("No listener", key);
      return;
    }
    try {
      await this.listeners[key](this._val, prevVal);
    } catch (e) {
      console.error(e);
    }
  }

  /** Use when adding a listener that must work all the time. Returns a function to cancel listening. */
  addListener(listener: (val: T, prevVal: T) => void, immediatelyNotify = true) {
    const key = "" + keyGeneratorCounter;
    ++keyGeneratorCounter;
    ++observableCounter;
    this.listeners[key] = listener;
    if (immediatelyNotify) {
      setTimeout(() => {
        this.notifyListener(key, undefined);
      }, 10);
    }
    return () => {
      --observableCounter;
      delete this.listeners[key];
    };
  }
}
