import { useAtom } from "jotai";
import { Suspense, useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import Search from "./components/Search"
import UrlList from "./components/UrlList"
import { bookmarksAtom } from "./state";

type AO = {
    children: []
}[]

function areSame(ob: AO, ob2: AO): boolean {
    if (ob.length === ob2.length) {
        for (let i = 0; i < ob.length; ++i) {
            if (ob[i].children.length !== ob2[i].children.length) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function App() {
    const searchRef = useRef<HTMLInputElement>();
    const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
    console.log(bookmarks, "bookmarks -- ");

    console.log("app");

    useEffect(() => {
        const addStateUpdateListener = (key: string) => {
            if (typeof chrome.storage === "undefined") {
                console.log("This is web.");
                return;
            }
            console.log("This is extension.");
            chrome.storage.onChanged.addListener((changes, namespace) => {
                console.log("Changes detected: ", changes)
                for (let k of Object.keys(changes)) {
                    console.log("Key :", k, "Desired :", key);
                    if (k === key) {
                        if (areSame(changes[key].newValue, changes[key].oldValue)) {
                            console.log("No addition or removal of list or urls");
                            return;
                        }
                        console.log("New Value to be set: ", changes[key].newValue);
                        setBookmarks(changes[key].newValue);
                        break;
                    }
                }
            })
        }

        addStateUpdateListener("bookmarks");

        const cmdListener = (e: KeyboardEvent) => {
            if (e.key === "/") {
                searchRef.current?.focus();
            }
        }

        window.addEventListener("keyup", cmdListener);

        return () => {
            window.removeEventListener("keyup", cmdListener);
        }

    }, [])

    return (
        <Suspense>
            <div className="h-full w-[95%] lg:max-w-[1100px] overflow-x-hidden">
                <div className="h-full grid grid-cols-4 text-white font-white w-full">
                    <Navbar />
                    <div className="border-l border-r border-dark-gray col-span-2 h-full">
                        <UrlList className="col-span-2 h-full" />
                    </div>
                    <div className="p-3 max-w-[300px]">
                        <Search {...{ searchRef }} />
                    </div>
                </div>
            </div>
        </Suspense>
    )
}

export default App
