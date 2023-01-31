import { Provider, useAtom } from "jotai";
import { useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import Search from "./components/Search"
import UrlList from "./components/UrlList"
import { bookmarksAtom } from "./state";

function App() {
    const searchRef = useRef<HTMLInputElement>();
    console.log("app")

    const [_, setBookmarks] = useAtom(bookmarksAtom);

    useEffect(() => {
        const addStateUpdateListener = (key: string) => {
            chrome.storage.onChanged.addListener((changes, namespace) => {
                console.log(changes, namespace)
                console.log("added something new so updating..")
                console.log(Object.keys(changes));
                for (let k of Object.keys(changes)) {
                    console.log(k);
                    if (k === key) {
                        console.log(changes[key].newValue)
                        // setBookmarks(changes[key].newValue);
                        setBookmarks([]);
                        console.log("emptying")
                        break;
                    }
                }
            })
        }
        setBookmarks([]);
        console.log("emptying"); 
        addStateUpdateListener("bookmarks"); 
        addStateUpdateListener("polling"); 

        const cmdListener = (e: KeyboardEvent) => {
            if (e.key === "/") {
                searchRef.current?.focus();
            }
        }

        // addStateUpdateListener("bookmarks", setBookmarks);

        window.addEventListener("keyup", cmdListener);

        return () => {
            window.removeEventListener("keyup", cmdListener);
        }

    }, [])

    return (
        <Provider>
            <div className="mx-auto h-full w-7xl max-w-7xl">
                <div className="h-full grid grid-cols-4 text-white font-white w-full">
                    <Navbar />
                    <div className="border-l w-full border-r border-dark-gray col-span-2 h-full">
                        <UrlList />
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
