import { atom } from "jotai";
import { Bookmark } from "../types";

const getInitialValue = async (): Promise<Bookmark> => {
    const data = await new Promise(res => chrome.storage.local.get(["bookmarks"], (d) => {
        res(d);
    }))
    return data as Promise<Bookmark>;
}

// const data = await getInitialValue(); 

export const bookmarksAtom = atom(await getInitialValue());

export const readBookmarksAtom = atom((get) => get(bookmarksAtom));

export const bookmarksAtomStrong = atom(
    (get) => get(bookmarksAtom),
    async (get, set, bookmarks: Bookmark) => {
        try {
            await chrome.storage.local.set({
                bookmarks: bookmarks
            })
            return set(bookmarksAtom, bookmarks);
        } catch (e) {
            console.log(e)
        }
    }
)

export const atomWithAsyncStorage = (key: string, initialValue: {}) => {
    const baseAtom = atom(initialValue)
    baseAtom.onMount = (setValue) => {
        ; (async () => {
            const item = await chrome.storage.local.get([key])
            setValue(item)
        })()
    }
    const derivedAtom = atom(
        (get) => get(baseAtom),
        (get, set, update) => {
            const nextValue =
                typeof update === 'function' ? update(get(baseAtom)) : update
            set(baseAtom, nextValue)
            chrome.storage.local.set({ key: nextValue })
        }
    )
    return derivedAtom
}

export const searchTypeAtom = atom("sa");
export const searchQueryAtom = atom("");
export const selectionActiveAtom = atom(false);
export const currentListAtom = atom("Home");
export const openedSectionAtom = atom(
    (get) => get(currentListAtom),
    (_get, set, str: string) => {
        console.log(str); return set(currentListAtom, str);
    });
