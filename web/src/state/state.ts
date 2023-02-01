import { atom } from "jotai";
import { Bookmarks } from "../types";
import { AsyncStorage } from "../utils/storage";

export const atomWithAsyncStorage = <T>(key: string, initialValue: T, storage: AsyncStorage<T>) => {
    const baseAtom = atom(initialValue);
    baseAtom.onMount = (setValue) => {
        ; (async () => {
            const item = await storage.getItem(key);
            console.log("item from storage.local: ", item);
            setValue(item!);
        })()
    }
    const derivedAtom = atom(
        (get) => { console.log("get(baseAtom)", get(baseAtom)); return get(baseAtom) },
        async (get, set, update) => {
            const nextValue: T = typeof update === 'function' ? update(get(baseAtom)) : update;
            console.log("Set Async Atom", nextValue);
            set(baseAtom, nextValue);
            await storage.setItem(key, nextValue);
            console.log("Base Atom after update: ", get(baseAtom));
        }
    )
    return derivedAtom
}

const storageKey = "myAtomKey";

export const bookmarksAtom = atom({
    key: storageKey,
    default: null,
    persistence_UNSTABLE: {
        get: async () => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get([storageKey], result => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result[storageKey]);
                    }
                });
            });
        },
        set: async (val) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set({ [storageKey]: val }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(val);
                    }
                });
            });
        }
    }
});

// export const bookmarks = myAtomWithStorage<Bookmarks>("bookmarks", []);

// export const bookmarksAtom = atomWithStorageAuto<Bookmarks>("bookmarks", []);

const storage = new AsyncStorage<Bookmarks>();

export const bookmarksState = atomWithAsyncStorage<Bookmarks>("bookmarks", [], storage);

// export const bookmarksAtom = atom(
//     (get) => get(bookmarksState),
//     (get, set, update) => {
//         set(bookmarksState, update);
//     })

export const searchTypeAtom = atom("sa");

export const searchQueryAtom = atom("");
 
export const selectionActiveAtom = atom(false);

export const currentListAtom = atom(
    (get) => get(bookmarksAtom).persistence_UNSTABLE.get().find(e => e.selected)?.title,
    (get, set, title: string) => {
        set(bookmarksAtom, get(bookmarksAtom).map(e => ({ ...e, selected: e.title == title })));
    });

export const openedSectionAtom = atom(
    (get) => get(currentListAtom),
    (get, set, title: string) => {
        set(bookmarksAtom, get(bookmarksAtom).map(e => ({ ...e, title: e.selected ? title : e.title })));
    });

export const urllistAtom = atom((get) => get(bookmarksAtom).find(e => e.title === get(currentListAtom))?.children);
