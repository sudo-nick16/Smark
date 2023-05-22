import { isChrome } from "../utils/isChrome";

export function getSyncItem<T>(key: string): T | undefined {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return undefined;
        }
        const item = JSON.parse(itemStr!);
        return item
    } catch (err) {
        return undefined;
    }
}

export function setSyncItem<T>(key: string, value: T): boolean {
    try {
        const str = JSON.stringify(value);
        localStorage.setItem(key, str);
        return true
    } catch (err) {
        return false;
    }
}

export async function getAsyncItem<T>(key: string): Promise<T | undefined> {
    const item = (await chrome.storage.local.get(key))
    if (!item || !item[key]) {
        return undefined;
    }
    return item[key] as T;
}

export async function setAsyncItem<T>(key: string, val: T): Promise<boolean> {
    try {
        await chrome.storage.local.set({ [key]: val });
        return true
    } catch (err) {
        return false;
    }
}

export async function getItem<T>(key: string): Promise<T | undefined> {
    if (isChrome()) {
        return await getAsyncItem<T>(key);
    }
    return getSyncItem<T>(key);
}

export async function setItem<T>(key: string, value: T): Promise<boolean> {
    if (isChrome()) {
        return await setAsyncItem<T>(key, value);
    }
    return setSyncItem<T>(key, value);
}
