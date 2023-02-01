import { Provider, useAtom } from "jotai";
import { useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import Search from "./components/Search"
import UrlList from "./components/UrlList"
import { bookmarksAtom } from "./state";

function App() {
    const searchRef = useRef<HTMLInputElement>();
    const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);

    console.log("app")

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
                        console.log(bookmarks === changes[key].newValue)
                        const data = changes[key].newValue;
                        console.log("New Value to be set: ", data);
                        setBookmarks(bookmarks);
                        break;
                    }
                }
            })
        }

        const getInitialValue = async () => {
            console.log("Initial Data on load: ", bookmarks);
        }
        getInitialValue();

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
        <Provider>
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
        </Provider>
    )
}

export default App
