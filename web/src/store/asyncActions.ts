import { createAsyncThunk } from "@reduxjs/toolkit";
import { BookmarkListWithChildren, Event } from "../types";
import { getItem, setItem } from "./storageApi";

const getBookmarks = async () => {
    return await getItem<BookmarkListWithChildren[]>("bookmarks", [
        { title: "Home", public: false, userId: "", children: [] },
    ]);
};

const getSmarkEvents = async () => {
    return await getItem<Event[]>("smark_events", [
        {
            type: "create_list",
            data: { title: "Home" },
        },
    ]);
};

export const setBookmarksFromStorage = createAsyncThunk(
    "storage/setBookmarksFromStorage",
    async () => {
        const bookmarks = await getBookmarks();
        const events = await getSmarkEvents();
        return {
            bookmarks: bookmarks,
            events: events,
        };
    }
);

export const setBookmarks = createAsyncThunk(
    "storage/setBookmarks",
    async (bookmarks: BookmarkListWithChildren[]) => {
        await setItem("bookmarks", bookmarks);
        return {
            bookmarks: bookmarks,
        };
    }
);

export const clearSmarkEvents = createAsyncThunk(
    "storage/clearSmarkEvents",
    async () => {
        await setItem("smark_events", []);
    }
);

export const createList = createAsyncThunk(
    "bookmark/createList",
    async (list: string) => {
        const bookmarks = await getBookmarks();
        const events = await getSmarkEvents();
        if (bookmarks.find((l) => l.title === list)) {
            return {
                bookmarks: bookmarks,
                events: events,
            };
        }
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
        const bookmarks = await getBookmarks();
        const events = await getSmarkEvents();
        if (listTitle.toLowerCase() === "home") {
            return {
                bookmarks,
                events,
            };
        }
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
        const bookmarks = await getBookmarks();
        const events = await getSmarkEvents();
        if (oldTitle.toLowerCase() === "home") {
            return {
                bookmarks,
                events,
            };
        }
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
    async (title: string) => {
        const bookmarks = await getBookmarks();
        const events = await getSmarkEvents();
        if (title.toLowerCase() === "home") {
            return {
                bookmarks,
                events,
            };
        }
        bookmarks.forEach((list) => {
            if (list.title === title) {
                list.public = !list.public;
            }
        });
        events.push({
            type: "update_list_visibility",
            data: {
                title,
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
        const bookmarks = await getBookmarks();
        const events = await getSmarkEvents();
        bookmarks.forEach((list) => {
            if (list.title === bookmark.listTitle) {
                if (list.children.find((b) => b.url === bookmark.url)) {
                    return {
                        bookmarks,
                        events,
                    };
                }
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
        const bookmarks = await getBookmarks();
        const events = await getSmarkEvents();

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
        console.log("delete bookmark");
        await setItem("bookmarks", updatedBookmarks);
        await setItem("smark_events", events);
        return {
            bookmarks: updatedBookmarks,
            events,
        };
    }
);

export const updateBookmark = createAsyncThunk(
    "bookmark/updateBookmark",
    async (payload: {
        oldTitle: string;
        newTitle: string;
        url: string;
        listTitle: string;
    }) => {
        const bookmarks = await getBookmarks();
        const events = await getSmarkEvents();

        console.log("update bookmark");

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
            type: "update_bookmark",
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

// export const updateBookmarkTitle = createAsyncThunk(
//   "bookmark/updateBookmarkTitle",
//   async (payload: {
//     oldTitle: string;
//     newTitle: string;
//     listTitle: string;
//   }) => {
//     const bookmarks = await getItem<BookmarkListWithChildren[]>(
//       "bookmarks",
//       []
//     );
//     const events = await getItem<Event[]>("smark_events", []);
//     bookmarks.forEach((list) => {
//       if (list.title === payload.listTitle) {
//         list.children.forEach((bookmark) => {
//           if (bookmark.title === payload.oldTitle) {
//             bookmark.title = payload.newTitle;
//           }
//         });
//       }
//     });
//     events.push({
//       type: "update_bookmark_title",
//       data: {
//         oldTitle: payload.oldTitle,
//         newTitle: payload.newTitle,
//         listTitle: payload.listTitle,
//       },
//     });
//     await setItem("bookmarks", bookmarks);
//     await setItem("smark_events", events);
//     return {
//       bookmarks,
//       events,
//     };
//   }
// );
//
// export const updateBookmarkUrl = createAsyncThunk(
//   "bookmark/updateBookmarkUrl",
//   async ({
//     title,
//     url,
//     listTitle,
//   }: {
//     title: string;
//     url: string;
//     listTitle: string;
//   }) => {
//     const bookmarks = await getItem<BookmarkListWithChildren[]>(
//       "bookmarks",
//       []
//     );
//     const events = await getItem<Event[]>("smark_events", []);
//     bookmarks.forEach((list) => {
//       if (list.title === listTitle) {
//         list.children.forEach((bookmark) => {
//           if (bookmark.title === title) {
//             bookmark.url = url;
//           }
//         });
//       }
//     });
//     events.push({
//       type: "update_bookmark_url",
//       data: {
//         title: title,
//         url: url,
//         listTitle: listTitle,
//       },
//     });
//     await setItem("bookmarks", bookmarks);
//     await setItem("smark_events", events);
//     return {
//       bookmarks,
//       events,
//     };
//   }
// );
