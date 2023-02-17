console.log("Hello Friend.")

chrome.omnibox.setDefaultSuggestion(
    {
        description: "Open smark",
    }
);

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
};

// async function openSmarkInCurrTab() {
//     let queryOptions = { active: true, lastFocusedWindow: true };
//     let [tab] = await chrome.tabs.query(queryOptions);
//     return tab;
// }

const queryTypes = ["l", "u"];

chrome.omnibox.onInputEntered.addListener((text) => {
    // Encode user input for special characters , / ? : @ & = + $ #

    const args = text.split(/ (.*)/s);
    const type = args[0].length === 1 && queryTypes.includes(args[0]) ? args[0] : "";
    const query = type ? args[1] : text;

    console.log("args: ", args);
    console.log("type: ", type);
    console.log("query: ", query);

    var newURL = `chrome-extension://fmolcfaicblfnadllocamjmheeaabhif/options/index.html?q=${encodeURIComponent(query)}${type ? `&t=${type}` : ""}`;
    chrome.tabs.create({ url: newURL });
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("installed. ");
    chrome.storage.local.get(["bookmarks"], (data) => {
        if (!data.bookmarks) {
            console.log("First time.");
            chrome.storage.local.set({
                "bookmarks": []
            }, () => {
                console.log("storage set.");
                chrome.storage.managed.get(["bookmarks"], (data) => {
                    console.log("data: ", data);
                })
            })
        }
    })

    chrome.contextMenus.create({
        title: "Add to Smark",
        id: "smark",
        contexts: [
            "page",
        ],
    }, () => {
        console.log("context menu added ig.");
    })
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info, tab);
    chrome.storage.local.get(["bookmarks"], (data) => {
        const newBook = {
            title: tab?.title,
            icon: tab?.favIconUrl,
            url: tab?.url,
            selected: false,
            favorite: false,
            children: []
        }
        console.log('data inside onclick', data)
        if (data.bookmarks.length === 0) {
            console.log("adding the first bookmark to home");
            chrome.storage.local.set({
                bookmarks: [
                    ...data.bookmarks,
                    {
                        title: "Home",
                        icon: "",
                        url: "",
                        selected: true,
                        favorite: false,
                        children: [
                            newBook
                        ]
                    },
                ]
            })
            chrome.storage.local.get(["bookmarks"], (d) => {
                console.log("after setting first bookmark", d);
            })
            return;
        } else {
            chrome.storage.local.set({
                bookmarks: data.bookmarks.map((c: any) => {
                    if (c.title === "Home") {
                        return {
                            ...c,
                            children: [...c.children, newBook],
                        }
                    }
                    return c;
                })
            });
        }
    })
    // everything works out of the box
    console.log("added to smark clicked.")
})


chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.msg === "AuthUser") {
        chrome.identity.clearAllCachedAuthTokens(() => {
            console.log('cleared auth tokens ig');
        })
        chrome.identity.getAuthToken({ interactive: true }, async function(token) {
            console.log(token);
            const req = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
            const data = await req.json();
            console.log(data);
        });
        sendResponse({
            msg: "oki boi",
        });
    }
});
