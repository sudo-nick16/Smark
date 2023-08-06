console.log("smark");

type Bookmark = {
    _id?: string;
    title: string;
    img: string;
    url: string;
    listTitle: string;
    userId: string;
};

type BookmarkList = {
    _id?: string;
    title: string;
    public: boolean;
    userId: string;
};

type SyncEvent = {
    type: string;
    data: any;
};

type BookmarkListWithChildren = {
    _id?: string;
    title: string;
    public: boolean;
    userId: string;
    children: Bookmark[];
};

const BASE_SERVER_URL = "https://smark-prod.onrender.com";
const MAX_RETRIES_COUNT = 5;
const EXTENSION_URL =
    "chrome-extension://fmolcfaicblfnadllocamjmheeaabhif/options/index.html#/";
const HEART_BEAT_PERIOD = 1000 * 60;
const QUERY_MAP = new Map([
    ["l", "list"],
    ["u", "url"],
]);

let accessToken = "";
let accessTokenRetries = 0;

// set suggestion
chrome.omnibox.setDefaultSuggestion({
    description: "Open smark",
});

async function getAsyncItem<T>(key: string): Promise<T | undefined> {
    const item = await chrome.storage.local.get(key);
    if (!item || !item[key]) {
        return undefined;
    }
    return item[key] as T;
}

async function setAsyncItem<T>(key: string, val: T): Promise<boolean> {
    try {
        await chrome.storage.local.set({ [key]: val });
        return true;
    } catch (err) {
        return false;
    }
}

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
    let item = await getAsyncItem<T>(key);
    if (!item) {
        await setAsyncItem<T>(key, defaultValue);
        return defaultValue;
    }
    return item;
}

async function getBookmarks() {
    return await getItem<BookmarkListWithChildren[]>("bookmarks", [
        {
            title: "Home",
            public: false,
            userId: "",
            children: [],
        },
    ]);
}

async function getSmarkEvents() {
    return await getItem<SyncEvent[]>("smark_events", [
        {
            type: "create_list",
            data: {
                title: "Home",
            },
        },
    ]);
}

async function getDefaultList() {
    return await getItem<string>("defaultList", "Home");
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function syncEvents() {
    const events = await getSmarkEvents();
    try {
        const res = await fetch(BASE_SERVER_URL + "/sync", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify({
                events,
            }),
        });
        const data = await res.json();
        return data;
    } catch (e) {}
    return undefined;
}

async function handleOmniBookmarkWithList(listTitle: string, query: string) {
    const bookmarks = (await chrome.storage.local.get("bookmarks"))[
        "bookmarks"
    ] as BookmarkListWithChildren[];
    const bookmark = bookmarks
        .find(
            (list) =>
                list.title
                    .trim()
                    .toLowerCase()
                    .indexOf(listTitle.trim().toLowerCase()) !== -1
        )
        ?.children.find(
            (bm) =>
                bm.title
                    .trim()
                    .toLowerCase()
                    .indexOf(query.trim().toLowerCase()) !== -1 ||
                bm.url
                    .trim()
                    .toLowerCase()
                    .indexOf(query.trim().toLowerCase()) !== -1
        );
    if (bookmark) {
        await chrome.tabs.update({ url: bookmark.url });
        return;
    }
    handleOmniNoBookmark();
}

async function handleOmniBookmark(query: string) {
    const bookmarks = (await chrome.storage.local.get("bookmarks"))[
        "bookmarks"
    ] as BookmarkListWithChildren[];
    const bookmark = bookmarks
        .map((list) => list.children)
        .flat()
        .find(
            (bm) =>
                bm.title
                    .trim()
                    .toLowerCase()
                    .indexOf(query.trim().toLowerCase()) !== -1 ||
                bm.url
                    .trim()
                    .toLowerCase()
                    .indexOf(query.trim().toLowerCase()) !== -1
        );
    if (bookmark) {
        await chrome.tabs.update({ url: bookmark.url });
        return;
    }
    handleOmniNoBookmark();
}

async function handleOmniNoBookmark() {
    await chrome.tabs.update({ url: EXTENSION_URL });
}

chrome.omnibox.onInputEntered.addListener(async (text) => {
    if (!text.trim()) {
        handleOmniNoBookmark();
        return;
    }
    const args = text.split(";");
    if (args.length > 1) {
        const listTitle = args[0];
        const query = args[1];
        await handleOmniBookmarkWithList(listTitle, query);
    } else if (args.length === 1) {
        await handleOmniBookmark(args[0]);
    }
});

async function fetchAccessToken() {
    console.log("Fetching access token");
    try {
        const res = await fetch(BASE_SERVER_URL + "/refresh-token", {
            method: "POST",
            credentials: "include",
        });
        const data: { accessToken: string } = await res.json();
        if (data.accessToken) {
            accessToken = data.accessToken;
            accessTokenRetries = 0;
            return;
        }
    } catch (e) {
        console.log("error while fetching access token: ", e);
    }
    accessTokenRetries++;
}

async function ensureAccessToken() {
    console.log("Ensuring access token");
    if (accessToken) {
        return;
    }
    await fetchAccessToken();
    if (!accessToken && accessTokenRetries <= MAX_RETRIES_COUNT) {
        setTimeout(async () => {
            return await ensureAccessToken();
        }, 10 * 1000);
    }
}

async function getAccessToken() {
    // if hasn't already tried or if the token is empty
    if (accessTokenRetries >= MAX_RETRIES_COUNT && accessToken === "") {
        console.log("Max retries reached, cannot refresh the token.");
        return;
    }
    try {
        // if the token is empty, then we need to fetch it
        accessTokenRetries++;
        const res = await fetch(BASE_SERVER_URL + "/refresh-token", {
            method: "POST",
            credentials: "include",
        });
        const data: { accessToken: string } = await res.json();
        if (data.accessToken) {
            accessToken = data.accessToken;
            accessTokenRetries = 0;
            return;
        }
    } catch (e) {
        console.log("error while fetching access token: ", e);
    }
    accessToken = "";
    setTimeout(async () => {
        await fetchAccessToken();
    }, 10 * 1000);
}

async function syncBookmarks() {
    console.log("syncing bookmarks");

    await ensureAccessToken();

    if (accessTokenRetries >= MAX_RETRIES_COUNT && accessToken === "") {
        console.log("access token is empty, cannot sync.");
        setTimeout(() => {
            accessTokenRetries = 0;
            syncBookmarks();
        }, HEART_BEAT_PERIOD);
        return;
    }

    try {
        const events = await getSmarkEvents();
        const res = await fetch(BASE_SERVER_URL + "/sync", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify({
                events,
            }),
        });
        const data = await res.json();
        if (!data.error) {
            await setAsyncItem("smark_events", []);
        }
    } catch (e) {
        console.log("error (while syncing): ", e);
    }
    setTimeout(async () => {
        await syncBookmarks();
    }, HEART_BEAT_PERIOD);
}

syncBookmarks();

chrome.runtime.onInstalled.addListener(async () => {
    console.log("Thanks for using smark.");
    console.log("you are using smark for the first time.");

    await getBookmarks();
    await getSmarkEvents();
    await getDefaultList();

    chrome.contextMenus.create(
        {
            title: "Add to smark",
            id: "smark",
            contexts: ["page"],
        },
        () => {
            console.log("context menu added.");
        }
    );
});

async function addBookmark(bookmark: Bookmark) {
    const bookmarks = await getBookmarks();
    const smarkEvents = await getSmarkEvents();
    const createBookmarkEvent = {
        type: "create_bookmark",
        data: bookmark,
    };
    smarkEvents.push(createBookmarkEvent);
    bookmarks.forEach((list) => {
        if (list.title === bookmark.listTitle) {
            if (!list.children.find((bm) => bm.url === bookmark.url)) {
                list.children.push(bookmark);
            }
        }
    });

    await setAsyncItem("bookmark_mutex", true);
    await setAsyncItem("smark_events", smarkEvents);
    await setAsyncItem("bookmarks", bookmarks);

    const data = await syncEvents();
    if (data && !data.error) {
        await setAsyncItem("smark_events", []);
    }
    await setAsyncItem("bookmark_mutex", false);
}

chrome.contextMenus.onClicked.addListener(async (_, tab) => {
    const defaultList = await getDefaultList();
    const bookmark = {
        title: tab?.title,
        img: tab?.favIconUrl,
        url: tab?.url,
        listTitle: defaultList,
    } as Bookmark;
    await addBookmark(bookmark);
});

chrome.commands.onCommand.addListener(async (_) => {
    const defaultList = await getDefaultList();
    const tab = await getCurrentTab();
    const bookmark = {
        title: tab?.title,
        img: tab?.favIconUrl,
        url: tab?.url,
        listTitle: defaultList,
    } as Bookmark;
    await addBookmark(bookmark);
});
