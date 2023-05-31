import { createAsyncThunk } from "@reduxjs/toolkit";
import { BookmarkListWithChildren, Event } from "../types";
import { getItem, setItem } from "./storageApi";

export const setBookmarksFromStorage = createAsyncThunk(
    "bookmark/setBookmarksFromStorage",
    async () => {
        return {
            bookmarks: await getItem<BookmarkListWithChildren[]>("bookmarks", [
                { title: "Home", public: false, userId: "", children: [] },
            ]),
            events: await getItem<Event[]>("smark_events", []),
        };
    }
);

export const setBookmarks = createAsyncThunk(
    "bookmark/setBookmarks",
    async (bookmarks: BookmarkListWithChildren[]) => {
        await setItem("bookmarks", bookmarks);
        return bookmarks;
    }
);

export const clearSmarkEvents = createAsyncThunk(
    "bookmark/clearSmarkEvents",
    async () => {
        await setItem("smark_events", []);
    }
);

export const createList = createAsyncThunk(
    "bookmark/createList",
    async (list: string) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        bookmarks.push({
            title: list,
            public: false,
            userId: "",
            children: [],
        });
        events.push({ type: "create_list", data: { title: list } });
        await setItem("bookmarks", bookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks: bookmarks,
            events: events,
        };
    }
);

export const deleteList = createAsyncThunk(
    "bookmark/deleteList",
    async (listTitle: string) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        const filteredBookmarks = bookmarks.filter(
            (list) => list.title !== listTitle
        );
        events.push({
            type: "delete_list",
            data: {
                title: listTitle,
            },
        });
        await setItem("bookmarks", filteredBookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks: filteredBookmarks,
            events,
        };
    }
);

export const updateListTitle = createAsyncThunk(
    "bookmark/updateListTitle",
    async ({ oldTitle, newTitle }: { oldTitle: string; newTitle: string }) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        bookmarks.forEach((list) => {
            if (list.title === oldTitle) {
                list.title = newTitle;
            }
        });
        events.push({
            type: "update_list",
            data: {
                oldTitle: oldTitle,
                newTitle: newTitle,
            },
        });
        await setItem("bookmarks", bookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks,
            events,
        };
    }
);

export const updateListVisibility = createAsyncThunk(
    "bookmark/updateListVisibility",
    async ({ title }: { title: string }) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        bookmarks.forEach((list) => {
            if (list.title === title) {
                list.public = !list.public;
            }
        });
        events.push({
            type: "update_list",
            data: {
                title: title,
            },
        });
        await setItem("bookmarks", bookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks,
            events,
        };
    }
);

export const createBookmark = createAsyncThunk(
    "bookmark/createBookmark",
    async (bookmark: {
        listTitle: string;
        title: string;
        url: string;
        img: string;
    }) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        bookmarks.forEach((list) => {
            if (list.title === bookmark.listTitle) {
                list.children.push({ ...bookmark, userId: "" });
            }
        });
        events.push({
            type: "create_bookmark",
            data: {
                title: bookmark.title,
                listTitle: bookmark.listTitle,
                url: bookmark.url,
                img: bookmark.img,
            },
        });
        await setItem("bookmarks", bookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks,
            events,
        };
    }
);

export const deleteBookmark = createAsyncThunk(
    "bookmark/deleteBookmark",
    async ({ title, listTitle }: { title: string; listTitle: string }) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        const updatedBookmarks = bookmarks.map((list) => {
            if (list.title === listTitle) {
                return {
                    ...list,
                    children: list.children.filter((b) => b.title !== title),
                };
            }
            return list;
        });
        events.push({
            type: "delete_bookmark",
            data: {
                title: title,
                listTitle: listTitle,
            },
        });
        await setItem("bookmarks", bookmarks);
        await setItem("smark_events", [...events]);
        return {
            bookmarks: updatedBookmarks,
            events,
        };
    }
);

export const updateBookmark = createAsyncThunk(
    "bookmark/updateBookmarkTitle",
    async (payload: {
        oldTitle: string;
        newTitle: string;
        url: string;
        listTitle: string;
    }) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        bookmarks.forEach((list) => {
            if (list.title === payload.listTitle) {
                list.children.forEach((bookmark) => {
                    if (bookmark.title === payload.oldTitle) {
                        bookmark.title = payload.newTitle;
                        bookmark.url = payload.url;
                    }
                });
            }
        });
        events.push({
            type: "update_bookmark_title",
            data: {
                oldTitle: payload.oldTitle,
                newTitle: payload.newTitle,
                url: payload.url,
                listTitle: payload.listTitle,
            },
        });
        await setItem("bookmarks", bookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks,
            events,
        };
    }
);

export const updateBookmarkTitle = createAsyncThunk(
    "bookmark/updateBookmarkTitle",
    async (payload: {
        oldTitle: string;
        newTitle: string;
        listTitle: string;
    }) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        bookmarks.forEach((list) => {
            if (list.title === payload.listTitle) {
                list.children.forEach((bookmark) => {
                    if (bookmark.title === payload.oldTitle) {
                        bookmark.title = payload.newTitle;
                    }
                });
            }
        });
        events.push({
            type: "update_bookmark_title",
            data: {
                oldTitle: payload.oldTitle,
                newTitle: payload.newTitle,
                listTitle: payload.listTitle,
            },
        });
        await setItem("bookmarks", bookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks,
            events,
        };
    }
);

export const updateBookmarkUrl = createAsyncThunk(
    "bookmark/updateBookmarkUrl",
    async ({
        title,
        url,
        listTitle,
    }: {
        title: string;
        url: string;
        listTitle: string;
    }) => {
        const bookmarks = await getItem<BookmarkListWithChildren[]>(
            "bookmarks",
            []
        );
        const events = await getItem<Event[]>("smark_events", []);
        bookmarks.forEach((list) => {
            if (list.title === listTitle) {
                list.children.forEach((bookmark) => {
                    if (bookmark.title === title) {
                        bookmark.url = url;
                    }
                });
            }
        });
        events.push({
            type: "update_bookmark_url",
            data: {
                title: title,
                url: url,
                listTitle: listTitle,
            },
        });
        await setItem("bookmarks", bookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks,
            events,
        };
    }
);
