console.log("Hello Friend.")

chrome.omnibox.setDefaultSuggestion(
    {
        description: "https://google.co.in/",
    }
);

chrome.runtime.onInstalled.addListener(() => {
    console.log("installed. ");
    // chrome.storage.local.set({
    //     "bookmarks": []
    // }, () => {
    //     console.log("storage set.");
    //     chrome.storage.managed.get(["bookmarks"], (data) => {
    //         console.log("data: ", data);
    //     })
    // })

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
    chrome.storage.local.get(["bookmarks"], (data) => {
        const newBook = {
            title: tab?.title,
            icon: tab?.favIconUrl,
            url: tab?.url,
            selected: false,
            favorite: false,
            children: []
        }
        chrome.storage.local.set({
            bookmarks: data.bookmarks.map(c => {
                if (c.title === "Personal"){
                    return {
                        ...c,
                        children: [...c.children, newBook],
                    }
                }
                return c;
            })
        });
    })
    // everything works out of the box
    console.log("added to smark clicked.")
})
