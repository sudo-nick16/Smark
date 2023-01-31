import { Atom, atom, useAtom, WritableAtom } from "jotai";
import { Bookmark, Bookmarks } from "../types";

const getInitialValue = async (): Promise<Bookmarks> => {
    const getData = async (key: string) => {
        return await chrome.storage.local.get([key]);
    }
    const data = (await getData("bookmarks"))["bookmarks"];
    console.log("state data", data);
    return data as Bookmarks;
}

export const atomWithAsyncStorage = (key: string, initialValue: Bookmarks = []) => {
    const baseAtom = atom(initialValue)
    baseAtom.onMount = (setValue) => {
        ; (async () => {
            const item = (await chrome.storage.local.get([key]))[key];
            setValue(item)
        })()
    }
    const derivedAtom = atom(
        (get) => get(baseAtom),
        (get, set, update) => {
            console.log("set bookmarkAtom called");
            const nextValue: Bookmarks =
                typeof update === 'function' ? update(get(baseAtom)) : update
            console.log(nextValue, "new value ig");
            set(baseAtom, nextValue)
            chrome.storage.local.set({ key: nextValue }, () => {
                chrome.storage.local.get([key], (data) => {
                    console.log("inside set atom", data);
                })
            })
        }
    )
    return derivedAtom
}

// const createPersistAtom = (anAtom: WritableAtom, key: string) => atom(
//     (get) => get(anAtom),
//     async (get, set, action: { payload?: Bookmarks, type: string }) => {
//         if (action.type === 'load') {
//             const data = (await chrome.storage.local.get([key]))[key]
//             set(anAtom, data)
//         } else if (action.type === 'save') {
//             const data = get(anAtom)
//             await chrome.storage.local.set({ key: data })
//         }
//     },
// )

export const bookmarksAtom = atomWithAsyncStorage("bookmarks", []);
// const bookmarkState = atom<Bookmarks>([]);
// export const bookmarksAtom = createPersistAtom(bookmarkState, "bookmarks");

// export const bookmarksAtomStrong = atom(
//     (get) => get(bookmarksAtom),
//     async (get, set, bookmarks: Bookmarks) => {
//         try {
//             await chrome.storage.local.set({
//                 bookmarks: bookmarks
//             })
//             return set(bookmarksAtom, bookmarks);
//         } catch (e) {
//             console.log(e)
//         }
//     }
// )

export const searchTypeAtom = atom("sa");
export const searchQueryAtom = atom("");
export const selectionActiveAtom = atom(false);
export const currentListAtom = atom(
    (get) => get(bookmarksAtom).find(e => e.selected)?.title,
    (get, set, title: string) => {
        // const [_, writeB] = useAtom(bookmarksAtom);
        // writeB((b) => b.map(c => { c.selected = c.title === "title"; return c }));
        // console.log("updated");
        set(bookmarksAtom, get(bookmarksAtom).map(e => ({ ...e, selected: e.title == title })));
    });

export const openedSectionAtom = atom(
    (get) => get(currentListAtom),
    (get, set, title: string) => {
        // console.log("updated");
        set(bookmarksAtom, get(bookmarksAtom).map(e => ({ ...e, title: e.selected ? title : e.title })));
    });

export const urllistAtom = atom((get) => get(bookmarksAtom).find(e => e.title === get(currentListAtom))?.children);
