import { useEffect, useState } from "react";

type StorageKeys = "community" | "profile";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue] as const;
}