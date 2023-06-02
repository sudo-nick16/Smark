import { createAsyncThunk } from "@reduxjs/toolkit";
import { BookmarkListWithChildren, Event } from "../types";
import { getItem, setItem } from "./storageApi";
import { processEvents } from "../utils/processEvents";
import { bookmarks } from "./index";

export const setBookmarksFromStorage = createAsyncThunk(
  "bookmark/setBookmarksFromStorage",
  async () => {
    let bookmarks = await getItem<BookmarkListWithChildren[]>("bookmarks", [
      { title: "Home", public: false, userId: "", children: [] },
    ]);
    const events = await getItem<Event[]>("smark_events", []);
    bookmarks = await processEvents(bookmarks);
    return {
      bookmarks: bookmarks,
      events: events,
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
    if (bookmarks.find((l) => l.title.trim() === list.trim())) {
      return {
        bookmarks: bookmarks,
        events: events,
      };
    }
    bookmarks.push({
      title: list.trim(),
      public: false,
      userId: "",
      children: [],
    });
    events.push({ type: "create_list", data: { title: list.trim() } });
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
    if (listTitle.trim().toLowerCase() === "home") {
      return {
        bookmarks,
        events,
      };
    }
    const filteredBookmarks = bookmarks.filter(
      (list) => list.title.trim() !== listTitle.trim()
    );
    events.push({
      type: "delete_list",
      data: {
        title: listTitle.trim(),
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
    if (oldTitle.trim().toLowerCase() === "home") {
      return {
        bookmarks,
        events,
      };
    }
    bookmarks.forEach((list) => {
      if (list.title.trim() === oldTitle.trim()) {
        list.title = newTitle;
      }
    });
    events.push({
      type: "update_list",
      data: {
        oldTitle: oldTitle.trim(),
        newTitle: newTitle.trim(),
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
    const bookmarks = await getItem<BookmarkListWithChildren[]>(
      "bookmarks",
      []
    );
    const events = await getItem<Event[]>("smark_events", []);
    if (title.trim().toLowerCase() === "home") {
      return {
        bookmarks,
        events,
      };
    }
    bookmarks.forEach((list) => {
      if (list.title.trim() === title.trim()) {
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
        title: bookmark.title.trim(),
        listTitle: bookmark.listTitle.trim(),
        url: bookmark.url.trim(),
        img: bookmark.img.trim(),
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
      if (list.title.trim() === listTitle.trim()) {
        return {
          ...list,
          children: list.children.filter(
            (b) => b.title.trim() !== title.trim()
          ),
        };
      }
      return list;
    });
    events.push({
      type: "delete_bookmark",
      data: {
        title: title.trim(),
        listTitle: listTitle.trim(),
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
  "bookmark/updateBookmark",
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
      if (list.title.trim() === payload.listTitle.trim()) {
        list.children.forEach((bookmark) => {
          if (bookmark.title.trim() === payload.oldTitle.trim()) {
            bookmark.title = payload.newTitle.trim();
            bookmark.url = payload.url.trim();
          }
        });
      }
    });
    events.push({
      type: "update_bookmark",
      data: {
        oldTitle: payload.oldTitle.trim(),
        newTitle: payload.newTitle.trim(),
        url: payload.url.trim(),
        listTitle: payload.listTitle.trim(),
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
