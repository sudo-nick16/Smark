import { atom } from "jotai";
import { Bookmarks } from "../types";
import { myAtomWithStorage } from "../utils/storage";

export const bookmarksAtom = myAtomWithStorage<Bookmarks>("bookmarks", []);

export const searchTypeAtom = atom("sa");

export const searchQueryAtom = atom("");

const searchCommands = ["sa", "su", "sl"];
export const selectionActiveAtom = atom(false);

export const currentListAtom = atom(
    (get) => get(bookmarksAtom).find(e => e.selected),
    (get, set, title: string) => {
        set(bookmarksAtom, (b) => b.map(e => ({ ...e, selected: e.title === title })));
    }
);


export const openedSectionAtom = atom(
    (get) => get(currentListAtom),
    async (get, set, title: string) => {
        set(currentListAtom, title);
    }
)

export const searchActiveAtom = atom(false);
// (get) => searchCommands.includes(get(searchTypeAtom))
export const showAuthModalAtom = atom(true);

export const blist = atom<Bookmarks>([]);

export const urllistAtom = atom(
    (get) => get(bookmarksAtom).find(e => e.title === get(currentListAtom)?.title)?.children || []
)

export const searchListAtom = atom(
    (get) => {
        if (!get(searchActiveAtom)) {
            return
        }
        switch (get(searchTypeAtom)) {
            case "sa": {
                const urls = get(bookmarksAtom).reduce(
                    (acc, e) => {
                        const u = e.children.filter(b => b.title.toLowerCase().includes(get(searchQueryAtom).toLowerCase()) || b.url.toLowerCase().includes(get(searchQueryAtom).toLowerCase()));
                        return [...acc, ...u];
                    }, [] as Bookmarks)
                return urls;
            }
            case "su": {
                return get(bookmarksAtom).find(f => f.selected)!.children.filter(
                    b => b.title.toLowerCase().includes(get(searchQueryAtom).toLowerCase()) || b.url.toLowerCase().includes(get(searchQueryAtom).toLowerCase())
                )
            }
            case "sl": {
                return get(bookmarksAtom).filter(b => b.title.toLowerCase().includes(get(searchQueryAtom).toLowerCase()))
            }
        }
        // const urls = get(bookmarksAtom).reduce(
        //     (acc, e) => {
        //         const u = e.children.filter(b => b.title.includes(get(searchQueryAtom)) || b.url.includes(get(searchQueryAtom)));
        //         return [...acc, ...u];
        //     }, [] as Bookmarks)
        // return urls;
    }
)

export const isAuthAtom = atom(false);
export const accessTokenAtom = atom("");
