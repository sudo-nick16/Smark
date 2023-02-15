import { useAtom } from "jotai";
import { Suspense, useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import Search from "./components/Search"
import UrlList from "./components/UrlList"
import { accessTokenAtom, bookmarksAtom, isAuthAtom, searchActiveAtom } from "./state";
import axios from "axios";
import { SERVER_URL } from "./constants";

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
    const searchRef = useRef<HTMLInputElement>(null);
    const [bookmarks] = useAtom(bookmarksAtom);
    const [, setSearchActive] = useAtom(searchActiveAtom);
    const [, setAccessToken] = useAtom(accessTokenAtom);
    const [, setIsAuth] = useAtom(isAuthAtom);
    console.log(bookmarks, "bookmarks -- ");

    console.log("app");

    useEffect(() => {
        // const addStateUpdateListener = (key: string) => {
        //     if (typeof chrome.storage === "undefined") {
        //         console.log("This is web.");
        //         return;
        //     }
        //     console.log("This is extension.");
        //     chrome.storage.onChanged.addListener((changes, namespace) => {
        //         console.log("Changes detected: ", changes)
        //         for (let k of Object.keys(changes)) {
        //             console.log("Key :", k, "Desired :", key);
        //             if (k === key) {
        //                 if (areSame(changes[key].newValue, changes[key].oldValue)) {
        //                     console.log("No addition or removal of list or urls");
        //                     return;
        //                 }
        //                 console.log("New Value to be set: ", changes[key].newValue);
        //                 setBookmarks(changes[key].newValue);
        //                 break;
        //             }
        //         }
        //     })
        // }

        // addStateUpdateListener("bookmarks");

        const fetchAccessToken = async () => {
            const req = await axios.post(`${SERVER_URL}/auth/refresh-token`, {}, {
                withCredentials: true
            })
            if (req.data.error) {
                return;
            }
            if (req.data.accessToken) {
                setAccessToken(req.data.accessToken);
                setIsAuth(true);
                return
            }
            setIsAuth(false);
        }

        fetchAccessToken();

        const cmdListener = (e: KeyboardEvent) => {
            if (e.key === "/") {
                searchRef.current?.focus();
            }
            if (e.key === "Escape") {
                setSearchActive(false);
                searchRef.current?.blur();
            }
        }

        window.addEventListener("keyup", cmdListener);

        return () => {
            window.removeEventListener("keyup", cmdListener);
        }

    }, [])

    return (
        <Suspense>
            <div className="h-full w-[95%] xl:w-[1280px] 2xl:w-[1538px]">
                <div className="h-full grid grid-cols-4 text-white font-white w-full">
                    <Navbar />
                    <div className="border-l border-r border-dark-gray col-span-2 h-full">
                        <UrlList className="col-span-2 h-full" />
                    </div>
                    <div className="p-3 ">
                        <Search {...{ searchRef }} />
                    </div>
                </div>
            </div>
        </Suspense>
    )
}

export default App
