console.log("Hello Friend.")

chrome.omnibox.setDefaultSuggestion(
    {
        description: "https://google.co.in/",
    }
);

chrome.runtime.onInstalled.addListener(() => {
    console.log("installed. ");
    chrome.storage.local.set({
        "smark": {
            autoSync: true,
            pollRefreshRate: true,
            defaultServiceUrl: "http://localhost:8080",
            user: {
                name: "",
                username: "",
                email: "",
            },
            syncStatus: "",
        }
    }, () => {
        console.log("storage set.");
        chrome.storage.managed.get(["smark"], (data) => {
            console.log("data: ", data);
        })
    })

    chrome.storage.managed.get("User", (data) => {
        console.log("data: ", data);
    })


    chrome.contextMenus.create({
        title: "Add to Smark",
        id: "smark",
        // documentUrlPatterns: ["*://**"],
        contexts: [
            "all",
        ],
    }, () => {
        console.log("context menu added ig.");
    })
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info, tab);
    // everything works out of the box
    console.log("added to smark clicked.")
})
