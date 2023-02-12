import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export class AsyncStorage<T> {
    getItem = async (key: string): Promise<T | null> => {
        console.log("accessing chrome.local");
        try {
            const data = (await chrome.storage.local.get(key))[key];
            console.log("accessed ", key, "got data", data)
            return data;
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    setItem = async (key: string, payload: T): Promise<void> => {
        console.log("writing to chrome.local");
        try {
            await chrome.storage.local.set({ [key]: payload });
        } catch (e) {
            console.log(e);
        }
    }
    removeItem = async (key: string): Promise<void> => {
        try {
            await chrome.storage.local.remove([key]);
        } catch (e) {
            console.log(e);
        }
    }
}

export class LocalStorage<T> {
    getItem = (key: string): T | null => {
        console.log("accessing chrome.local");
        try {
            const data = localStorage.getItem(key) || "";
            console.log("accessed ", key, "got data", data)
            return JSON.parse(data);
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    setItem = (key: string, payload: T): void => {
        console.log("writing to chrome.local");
        try {
            localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {
            console.log(e);
        }
    }
    removeItem = (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.log(e);
        }
    }
}

const atomWithAsyncStorage = <T>(key: string, initialValue: T, storage: AsyncStorage<T>) => {
    const baseAtom = atom(initialValue)
    baseAtom.onMount = (setValue) => {
        ; (async () => {
            const item = await storage.getItem(key)
            // @ts-ignore
            setValue(item);
        })()
    }
    const derivedAtom = atom(
        (get) => get(baseAtom),
        (get, set, update) => {
            const nextValue =
                typeof update === 'function' ? update(get(baseAtom)) : update
            set(baseAtom, nextValue)
            storage.setItem(key, nextValue);
        },

    )
    return derivedAtom
}

export const myAtomWithStorage = <T>(key: string, initialValue: T) => {
    if (typeof chrome.storage === "undefined") {
        console.log("This is web")
        return atomWithStorage<T>(key, initialValue, createJSONStorage(() => localStorage));
    }
    console.log("This is an extension")
    // @ts-ignore
    return atomWithAsyncStorage(key, initialValue, new AsyncStorage<T>())
};
