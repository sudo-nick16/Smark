import { atomWithStorage, createJSONStorage } from "jotai/utils";

export class AsyncStorage<T> {
    getItem = async (key: string): Promise<T | null> => {
        console.log("accessing chrome.local");
        try {
            const data = (await chrome.storage.local.get(key))[key];
            console.log("accessed ", key,"got data", data)
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

class LocalStorage {
    getItem = async <T>(key: string): Promise<T> => {
        console.log("accessing localStorage");
        try {
            const data = localStorage.getItem(key);
            if (!data) {
                return null as any;
            }
            return JSON.parse(data) as T;
        } catch (e) {
            console.log(e);
            return null as any;
        }
    }
    setItem = <T>(key: string, payload: T): void => {
        console.log("writing to localStorage");
        try {
            localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {
            console.log(e);
        }
    }
    removeItem = (key: string): void => {
        console.log("writing to localStorage");
        try {
            localStorage.setItem(key, "");
        } catch (e) {
            console.log(e);
        }
    }
}

export const atomWithStorageAuto = <T>(key: string, initialValue: T) => {
    let storage;
    if (typeof chrome.storage === "undefined") {
        storage = createJSONStorage<T>(() => new AsyncStorage());
    } else {
        storage = createJSONStorage<T>(() => localStorage);
    }
    // @ts-ignore
    return atomWithStorage<T>(key, initialValue, storage);
};
