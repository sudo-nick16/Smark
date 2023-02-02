import { atom } from "jotai";
import { Bookmarks } from "../types";
import { myAtomWithStorage } from "../utils/storage";

export const bookmarksAtom = myAtomWithStorage<Bookmarks>("bookmarks", []);

export const searchTypeAtom = atom("sa");

export const searchQueryAtom = atom("");

export const selectionActiveAtom = atom(false);

export const currentListAtom = atom(
    (get) => get(bookmarksAtom).find(e => e.selected)?.title,
    async (get, set, title: string) => {
        console.log(get(bookmarksAtom));
        set(bookmarksAtom, (b) => b.map(e => ({ ...e, selected: e.title == title })));
    });


export const openedSectionAtom = currentListAtom;
// atom(
// (get) => get(currentListAtom),
// async (get, set, title: string) => {
//     set(currentListAtom, get(bookmarksAtom).map(e => ({ ...e, title: e.selected ? title : e.title })));
// }
// );

export const urllistAtom = atom((get) => get(bookmarksAtom).find(e => e.title === get(currentListAtom))?.children);
