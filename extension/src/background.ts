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

const BASE_SERVER_URL = "http://localhost:42069";
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

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
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
    console.log("list", { bookmark });
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
    console.log({ bookmarks });
    console.log("flat list", bookmarks.map((list) => list.children).flat());
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
    console.log("only", { bookmark });
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
    if (!text.trim()){
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

    await fetchAccessToken();

    if (accessTokenRetries >= MAX_RETRIES_COUNT && accessToken === "") {
        console.log("access token is empty, cannot sync.");
        setTimeout(() => {
            accessTokenRetries = 0;
            syncBookmarks();
        }, HEART_BEAT_PERIOD);
        return;
    }

    try {
        const events =
            ((await chrome.storage.local.get("smark_events"))[
                "smark_events"
            ] as SyncEvent[]) || [];
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
        console.log("data: ", data);
        if (!data.error) {
            await chrome.storage.local.set({
                smark_events: [],
            });
        }
    } catch (e) {
        console.log("error (while syncing): ", e);
    }
    setTimeout(async () => {
        await syncBookmarks();
    }, HEART_BEAT_PERIOD);
}

const checkCurrentTab = async () => {
    const tab = await getCurrentTab();
    console.log(tab);
    setTimeout(checkCurrentTab, 500);
};

syncBookmarks();

function setInitialData(key: string, value: any) {
    chrome.storage.local.get([key], async (data) => {
        console.log("data: ", data);
        if (!data[key] || data[key]?.length === 0) {
            console.log("setting initial data for ", key);
            await chrome.storage.local.set({
                [key]: value,
            });
        }
    });
}

chrome.runtime.onInstalled.addListener(async () => {
    console.log("Thanks for using smark.");
    console.log("you are using smark for the first time.");

    setInitialData("bookmarks", [
        {
            title: "Home",
            public: true,
            userId: "",
            children: [],
        },
    ]);
    setInitialData("smark_events", [
        {
            type: "create_list",
            data: {
                title: "Home",
                public: true,
                userId: "",
            },
        },
    ]);

    await chrome.storage.local.set({
        defaultList: "Home",
    });

    chrome.contextMenus.create(
        {
            title: "Add to smark",
            id: "smark",
            contexts: ["page"],
        },
        () => {
            console.log("context menu created.");
        }
    );
});

async function addBookmark(bookmark: Bookmark) {
    const smarkEvents = (await chrome.storage.local.get("smark_events"))[
        "smark_events"
    ] as SyncEvent[];
    const createBookmarkEvent = {
        type: "create_bookmark",
        data: bookmark,
    };
    if (!smarkEvents) {
        await chrome.storage.local.set({
            smark_events: [createBookmarkEvent],
        });
        return;
    }
    smarkEvents.push(createBookmarkEvent);
    await chrome.storage.local.set({
        smark_events: smarkEvents,
    });

    const bookmarks = (await chrome.storage.local.get("bookmarks"))[
        "bookmarks"
    ] as BookmarkListWithChildren[];
    if (!bookmarks) {
        await chrome.storage.local.set({
            bookmarks: [
                {
                    title: "Home",
                    public: false,
                    userId: "",
                    children: [bookmark],
                },
            ],
        });
        return;
    }
    if (!bookmarks.find((l) => l.title === bookmark.listTitle)) {
        bookmark.listTitle = "Home";
    }
    bookmarks.forEach((list) => {
        if (list.title === bookmark.listTitle) {
            list.children.push(bookmark);
        }
        return list;
    });
    await chrome.storage.local.set({
        bookmarks,
    });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    let defaultList = (await chrome.storage.local.get("defaultList"))[
        "defaultList"
    ];
    if (!defaultList) {
        defaultList = "Home";
        await chrome.storage.local.set({ defaultList });
    }
    console.log(info, tab);
    const bookmark = {
        title: tab?.title,
        img: tab?.favIconUrl,
        url: tab?.url,
        listTitle: defaultList,
    } as Bookmark;
    await addBookmark(bookmark);
});

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.msg === "AuthUser") {
        chrome.identity.clearAllCachedAuthTokens(() => {
            console.log("cleared auth tokens ig");
        });
        chrome.identity.getAuthToken(
            { interactive: true },
            async function (token) {
                console.log(token);
                const req = await fetch(
                    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
                );
                const data = await req.json();
                console.log("auth token : ", data);
            }
        );
        sendResponse({
            msg: "oki boi",
        });
    }
});

chrome.commands.onCommand.addListener(async (_) => {
    const defaultList = (await chrome.storage.local.get("defaultList"))[
        "defaultList"
    ];
    const tab = await getCurrentTab();
    const bookmark = {
        title: tab?.title,
        img: tab?.favIconUrl,
        url: tab?.url,
        listTitle: defaultList,
    } as Bookmark;
    await addBookmark(bookmark);
});
