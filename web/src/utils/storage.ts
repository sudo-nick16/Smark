import { Bookmarks } from "../types";

export const getBookmarksFromStorage = async (): Promise<Bookmarks> => {
    try {
        const data = (await chrome.storage.local.get("bookmarks"))["bookmarks"];
        return data as Bookmarks;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export const setBookmarksFromStorage = async (bookmarks: Bookmarks): Promise<boolean> => {
    try {
        await chrome.storage.local.set({
            bookmarks
        });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
