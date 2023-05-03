import { useAtom } from "jotai";
import { Suspense, useEffect, useRef, useState } from "react"
import { accessTokenAtom, bookmarksAtom, isAuthAtom, searchActiveAtom, userAtom } from "./state";
import axios from "axios";
import { SERVER_URL } from "./constants";
import { BookmarkList, Bookmarks } from "./types";

function App() {
    const searchRef = useRef<HTMLInputElement>(null);
    const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
    const [user, setUser] = useAtom(userAtom);
    const [, setSearchActive] = useAtom(searchActiveAtom);
    const [, setAccessToken] = useAtom(accessTokenAtom);
    const [, setIsAuth] = useAtom(isAuthAtom);

    console.log("app");

    console.log("rerendered app");

    const addBookmark = async () => {
        const data = await chrome.tabs.getCurrent();
        console.log(data);
    }

    useEffect(() => {
        const fetchAccessToken = async () => {
            console.log("Fetching access token");
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

    const [list, setList] = useState("");

    return (
        <div className="p-3 text-white">
            <h1 className="text-lg font-bold">Smark</h1>
            <div className="flex flex-col">
                <button
                    className="px-3 py-1 s-shadow rounded-md mt-6"
                    onClick={addBookmark}
                >
                    Add
                </button>
                <select onChange={(e) => setList(e.target.value)} className="text-white bg-black mt-6">
                    {
                        bookmarks.map((v, i) => {
                            return (
                                <option value={v.title} key={i}>{v.title}</option>
                            )
                        })
                    }
                </select>
            </div>
        </div>
    )
}

export default App
