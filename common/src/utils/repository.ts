import { getItem } from "./storageApi";
import { BookmarkListWithChildren, Event } from "../types";

export const getBookmarks = async () =>
    await getItem<BookmarkListWithChildren[]>("bookmarks", [
        {
            title: "Home",
            public: false,
            userId: "",
            children: [],
        },
    ]);

export const getSmarkEvents = async () =>
    await getItem<Event[]>("smark_events", [
        {
            type: "create_list",
            data: {
                title: "Home",
            },
        },
    ]);

export const getDefaultList = async () =>
    await getItem<string>("defaultList", "Home");
