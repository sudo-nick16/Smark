import { createAsyncThunk } from "@reduxjs/toolkit";
import { Bookmark, BookmarkListWithChildren } from "../types";
import { getItem, setItem } from "./storageApi";

export const setBookmarksFromStorage = createAsyncThunk("bookmark/setBookmarksFromStorage", async () => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks");
    if (bookmarks && bookmarks.length > 0) {
        return bookmarks;
    }
    await setItem("bookmarks", [{ title: "Home", public: false, userId: "", children: [] }]);
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

export const createList = createAsyncThunk("bookmark/createList", async (list: string) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks && smarkEvents) {
        await setItem("bookmarks", [...bookmarks, { title: list, public: false, userId: "", children: [] }])
        await setItem("smark_events", [...smarkEvents, {
            type: "create_list",
            data: {
                title: list
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

export const deleteList = createAsyncThunk("bookmark/deleteList", async (listTitle: string) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks) {
        await setItem("bookmarks", bookmarks.filter((list) => list.title !== listTitle))
        await setItem("smark_events", [...smarkEvents, {
            type: "delete_list",
            data: {
                title: listTitle,
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

export const updateListTitle = createAsyncThunk("bookmark/updateListTitle", async ({ oldTitle, newTitle }: { oldTitle: string; newTitle: string }) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks) {
        await setItem("bookmarks", bookmarks.map((list) => {
            if (list.title === oldTitle) {
                return {
                    ...list,
                    title: newTitle
                };
            }
            return list;
        }))
        await setItem("smark_events", [...smarkEvents, {
            type: "update_list",
            data: {
                oldTitle: oldTitle,
                newTitle: newTitle,
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

export const updateListVisibility = createAsyncThunk("bookmark/updateListVisibility", async ({ title }: { title: string }) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks) {
        await setItem("bookmarks", bookmarks.map((list) => {
            if (list.title === title) {
                return {
                    ...list,
                    public: !list.public
                };
            }
            return list;
        }))
        await setItem("smark_events", [...smarkEvents, {
            type: "update_list",
            data: {
                title: title,
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

export const createBookmark = createAsyncThunk("bookmark/createBookmark", async (bookmark: { listTitle: string; title: string; url: string; img: string }) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks) {
        await setItem("bookmarks", bookmarks.map((list) => {
            if (list.title === bookmark.listTitle) {
                return {
                    ...list,
                    children: [...list.children, bookmark]
                }
            }
            return list;
        }));
        await setItem("smark_events", [...smarkEvents, {
            type: "create_bookmark",
            data: {
                title: bookmark.title,
                listTitle: bookmark.listTitle,
                url: bookmark.url,
                img: bookmark.img,
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

export const deleteBookmark = createAsyncThunk("bookmark/deleteBookmark", async ({ title, listTitle }: { title: string; listTitle: string }) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks) {
        await setItem("bookmarks", bookmarks.map((list) => {
            if (list.title === listTitle) {
                return {
                    ...list,
                    children: list.children.filter((b) => b.title !== title)
                }
            }
            return list;
        }))
        await setItem("smark_events", [...smarkEvents, {
            type: "delete_bookmark",
            data: {
                title: title,
                listTitle: listTitle,
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})


export const updateBookmark = createAsyncThunk("bookmark/updateBookmarkTitle", async (payload: { oldTitle: string; newTitle: string; url: string; listTitle: string }) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks) {
        await setItem("bookmarks", bookmarks.map((list) => {
            if (list.title === payload.listTitle) {
                return {
                    ...list,
                    children: list.children.map((bookmark) => {
                        if (bookmark.title === payload.oldTitle) {
                            return {
                                ...bookmark,
                                title: payload.newTitle,
                                url: payload.url,
                            }
                        }
                        return bookmark;
                    })
                }
            }
            return list;
        }))
        await setItem("smark_events", [...smarkEvents, {
            type: "update_bookmark_title",
            data: {
                oldTitle: payload.oldTitle,
                newTitle: payload.newTitle,
                url: payload.url,
                listTitle: payload.listTitle,
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

export const updateBookmarkTitle = createAsyncThunk("bookmark/updateBookmarkTitle", async (payload: { oldTitle: string; newTitle: string; listTitle: string }) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks) {
        await setItem("bookmarks", bookmarks.map((list) => {
            if (list.title === payload.listTitle) {
                return {
                    ...list,
                    children: list.children.map((bookmark) => {
                        if (bookmark.title === payload.oldTitle) {
                            return {
                                ...bookmark,
                                title: payload.newTitle
                            }
                        }
                        return bookmark;
                    })
                }
            }
            return list;
        }))
        await setItem("smark_events", [...smarkEvents, {
            type: "update_bookmark_title",
            data: {
                oldTitle: payload.oldTitle,
                newTitle: payload.newTitle,
                listTitle: payload.listTitle,
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

export const updateBookmarkUrl = createAsyncThunk("bookmark/updateBookmarkUrl", async ({ title, url, listTitle }: { title: string; url: string; listTitle: string }) => {
    const bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks")
    const smarkEvents = await getItem<Event[]>("smark_events") || [];
    if (bookmarks) {
        await setItem("bookmarks", bookmarks.map((list) => {
            if (list.title === listTitle) {
                return {
                    ...list,
                    children: list.children.map((bookmark) => {
                        if (bookmark.title === title) {
                            return {
                                ...bookmark,
                                url: url,
                            }
                        }
                        return bookmark;
                    })
                }
            }
            return list;
        }))
        await setItem("smark_events", [...smarkEvents, {
            type: "update_bookmark_url",
            data: {
                title: title,
                url: url,
                listTitle: listTitle,
            }
        }])
    }
    return await getItem<BookmarkListWithChildren[]>("bookmarks");
})

