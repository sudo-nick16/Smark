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

// const SERVER = "";
const MAX_RETRIES_COUNT = 5;
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

chrome.omnibox.onInputEntered.addListener((text) => {
    const args = text.split(";");
    if (args.length > 1) {
        const listTitle = args[0];
        const query = args[1];
        const newURL = `chrome-extension://fmolcfaicblfnadllocamjmheeaabhif/options/index.html#/search?query=${encodeURIComponent(
            query
        )}&listTitle=${listTitle}`;
        chrome.tabs.create({ url: newURL });
    } else if (args.length === 1) {
        const newURL = `chrome-extension://fmolcfaicblfnadllocamjmheeaabhif/options/index.html#/search?query=${encodeURIComponent(
            args[0]
        )}`;
        chrome.tabs.create({ url: newURL });
    }
    // const args = text.split(/ (.*)/s);
    // const type =
    //     args[0].length === 1 && Array.from(QUERY_MAP.keys()).includes(args[0])
    //         ? QUERY_MAP.get(args[0])
    //         : "";
    // const query = type ? args[1] : text;
    //
    // var newURL = `chrome-extension://fmolcfaicblfnadllocamjmheeaabhif/options/index.html#/search?query=${encodeURIComponent(
    //     query
    // )}${type ? `&type=${type}` : ""}&nav=true`;
    // chrome.tabs.create({ url: newURL });
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
        const res = await fetch("http://localhost:42069/refresh-token", {
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
        const res = await fetch("http://localhost:42069/sync", {
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
    let defaultList = (await chrome.storage.local.get("defaultList"))[
        "defaultList"
    ] as string;
    chrome.storage.local.get(["smark_events"], async (data) => {
        const createBookmarkEvent = {
            type: "create_bookmark",
            data: bookmark,
        };
        if (!data.smark_events) {
            await chrome.storage.local.set({
                smark_events: [createBookmarkEvent],
            });
            return;
        }
        await chrome.storage.local.set({
            smark_events: [...data.smark_events, createBookmarkEvent],
        });
    });
    // @ts-ignore
    chrome.storage.local.get(["bookmarks"], async (data: { bookmarks: BookmarkListWithChildren[] }) => {
        if (data.bookmarks.length === 0) {
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
        if (!data.bookmarks.find(l => l.title === defaultList)) {
            defaultList = "Home"
        }
        data.bookmarks.map((list: BookmarkListWithChildren) => {
            console.log(list);
            if (list.title === defaultList) {
                list.children.push(bookmark);
            }
            return list;
        });
        await chrome.storage.local.set({
            bookmarks: data.bookmarks,
        });
    });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const defaultList = (await chrome.storage.local.get("defaultList"))[
        "defaultList"
    ];
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
            async function(token) {
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
