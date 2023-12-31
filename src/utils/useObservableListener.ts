import { useEffect, useState } from "react";
import { Observable } from "./observable";

export default function useObservableListener<T>(observable: Observable<T>): T {
  const [obj, setObj] = useState(observable.get());
  useEffect(
    () => {
      return observable.addListener(() => setObj(observable.get()));
    },
    []
  );
  return obj;
}
