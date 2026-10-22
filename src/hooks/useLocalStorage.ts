"use client";

import {
  useCallback,
  useState,
  useSyncExternalStore,
  type SetStateAction,
} from "react";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
  subscribeToLocalStorage,
  type StorageKey,
} from "@/lib/storage";

const getClientReadySnapshot = () => true;
const getServerReadySnapshot = () => false;

export function useLocalStorage<T>(key: StorageKey, initialValue: T) {
  const [fallbackValue] = useState<T>(() => initialValue);
  const subscribe = useCallback(
    (subscriber: () => void) => subscribeToLocalStorage(key, subscriber),
    [key],
  );
  const getSnapshot = useCallback(
    () => getLocalStorage(key, fallbackValue),
    [fallbackValue, key],
  );
  const getServerSnapshot = useCallback(() => fallbackValue, [fallbackValue]);
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isReady = useSyncExternalStore(
    subscribe,
    getClientReadySnapshot,
    getServerReadySnapshot,
  );

  const setValue = useCallback(
    (nextValue: SetStateAction<T>) => {
      const currentValue = getLocalStorage(key, fallbackValue);
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (currentValue: T) => T)(currentValue)
          : nextValue;

      if (!setLocalStorage(key, resolvedValue)) {
        throw new Error(`Unable to write localStorage key "${key}".`);
      }
    },
    [fallbackValue, key],
  );

  const removeValue = useCallback(() => {
    if (!removeLocalStorage(key)) {
      throw new Error(`Unable to remove localStorage key "${key}".`);
    }
  }, [key]);

  return { value, setValue, removeValue, isReady };
}
