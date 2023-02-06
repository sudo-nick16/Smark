import { atom } from "jotai";
import { Bookmarks } from "../types";
import { myAtomWithStorage } from "../utils/storage";

export const bookmarksAtom = myAtomWithStorage<Bookmarks>("bookmarks", []);

export const searchTypeAtom = atom("sa");

export const searchQueryAtom = atom("");

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

export const searchActive = atom(false);
export const showAuthModalAtom = atom(true);

export const urllistAtom = atom((get) => get(bookmarksAtom).find(e => e.title === get(currentListAtom)?.title)?.children);
