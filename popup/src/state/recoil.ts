// import { atom, selector } from "recoil";
// import { Bookmarks } from "../types";
// import { AsyncStorage, LocalStorage, myAtomWithStorage } from "../utils/storage";
//
// // export const bookmarksAtom = myAtomWithStorage<Bookmarks>("bookmarks", []);
// const storage = typeof chrome.storage == "undefined" ? new LocalStorage<Bookmarks>() : new AsyncStorage<Bookmarks>();
//
// export const bookmarksState = selector({
//     key: "bookmarks",
//     get: async () => {
//         const bookmarks = storage.getItem("bookmarks")
//         return bookmarks;
//     }
// })
//
// export const searchType = atom({
//     key: "searchType",
//     default: "sa",
// });
//
// export const searchQuery = atom({
//     key: "searchQuery",
//     default: "",
// });
//
// export const selectionActive = atom({
//     key: "selectionActive",
//     default: false,
// });
//
// export const currentList = selector({
//     key: "currentList",
//     get: ({ get }) => {
//         return get(bookmarksState)!.find(e => e.selected);
//         // (get, set, title: string) => {
//         //     set(bookmarksAtom, (b) => b.map(e => ({ ...e, selected: e.title === title })));
//         // }
//     },
//     set: ({ get, set }, value) => {
//         set(bookmarksState, (b) => b!.map(e => ({ ...e, selected: e.title === value })));
//     }
// });
//
//
// export const openedSectionAtom = atom(
//     (get) => get(currentListAtom),
//     async (get, set, title: string) => {
//         set(currentListAtom, title);
//     }
// )
//
// export const searchActive = atom(false);
// export const showAuthModalAtom = atom(true);
//
// export const blist = atom<Bookmarks>([]);
//
// export const urllistAtom = atom(
//     (get) => get(bookmarksAtom).find(e => e.title === get(currentListAtom)?.title)?.children || [],
// )
//
//
// export const isAuthAtom = atom(false);
// export const accessTokenAtom = atom("");
