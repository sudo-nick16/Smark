import { useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import axios from "axios";
import { SERVER_URL } from "./constants";
import {
    logout,
    RootState,
    setAccessToken,
    setUser,
    useAppDispatch,
} from "./store/index";
import { Bookmark, BookmarkListWithChildren } from "./types";
import useAxios from "./utils/useAxios";
import { setBookmarksFromStorage } from "./store/asyncActions";
import { useSelector } from "react-redux";
import { getItem, setItem } from "./store/storageApi";
import Input from "./components/Input";
import MidPanel from "./components/MidPanel";
import { isChrome } from "./utils/isChrome";
import KeyListener from "./components/KeyListener";
import AuthModal from "./components/AuthModal";
import BookmarkEditModal from "./components/BookmarkEditModal";
import { useLocation, useNavigate } from "react-router-dom";

type AppProps = {};

function diff(
    oldVal: BookmarkListWithChildren[],
    newVal: BookmarkListWithChildren[]
): Bookmark | undefined {
    for (let i = 0; i < oldVal.length; i++) {
        if (oldVal[i].children.length !== newVal[i].children.length) {
            return newVal[i].children[newVal[i].children.length - 1];
        }
    }
    return undefined;
}

const App: React.FC<AppProps> = () => {
    const searchRef = useRef<HTMLInputElement>(null);
    const api = useAxios();
    const location = useLocation();
    const navigate = useNavigate();

    const appDispatch = useAppDispatch();
    const bookmarks = useSelector<RootState, BookmarkListWithChildren[]>(
        (state) => state.bookmarks
    );

    console.log({ bookmarks });

    useEffect(() => {
        const handleOmniSearch = async () => {
            console.log("searching");
            console.log(location);
            const params = Object.fromEntries(
                new URLSearchParams(location.search)
            );
            const localBookmarks = await getItem<BookmarkListWithChildren[]>(
                "bookmarks"
            );
            const query = params.query;
            if (!query) {
                navigate("/");
                return;
            }
            if (params.listTitle) {
                const listTitle = params.listTitle;
                const bookmark = localBookmarks!
                    .find((list) => list.title.trim().toLowerCase().indexOf(listTitle.trim().toLowerCase()) !== -1)
                    ?.children.find(
                        (b) =>
                            b.title
                                .trim()
                                .toLowerCase()
                                .indexOf(query.trim().toLowerCase()) !== -1 ||
                            b.url
                                .trim()
                                .toLowerCase()
                                .indexOf(query.trim().toLowerCase()) !== -1
                    );
                console.log(bookmark);
                if (bookmark) {
                    window.location.href = bookmark.url;
                    return;
                }
                navigate("/");
            }
            const bookmark = localBookmarks!
                .map((list) => list.children)
                .flat()
                .find(
                    (b) =>
                        b.title
                            .trim()
                            .toLowerCase()
                            .indexOf(query.trim().toLowerCase()) !== -1 ||
                        b.url
                            .trim()
                            .toLowerCase()
                            .indexOf(query.trim().toLowerCase()) !== -1
                );
            console.log(bookmark);
            if (bookmark) {
                window.location.href = bookmark.url;
                return;
            }
            navigate("/");
        };

        if (location.pathname === "/search") {
            handleOmniSearch();
        }

        appDispatch(setBookmarksFromStorage());

        const ensureStorage = async (key: string, defaultValue: any) => {
            const val = await getItem<any>(key);
            console.log({ val });
            if (!val) {
                await setItem(key, defaultValue);
            }
        };

        if (!isChrome()) {
            ensureStorage("bookmarks", [
                {
                    title: "Home",
                    public: false,
                    userId: "",
                    children: [],
                },
            ]);
            ensureStorage("smark_events", [
                {
                    type: "create_list",
                    data: {
                        title: "Home",
                    },
                },
            ]);
        }

        const fetchRefreshToken = async () => {
            try {
                const response = await axios.post(
                    `${SERVER_URL}/refresh-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                if (!response.data.error && response.data.accessToken) {
                    appDispatch(setAccessToken(response.data.accessToken));
                    const res = await api.get("/me");
                    console.log("res", res.data);
                    if (!res.data.error) {
                        appDispatch(setUser(res.data.user));
                    }
                } else {
                    console.log(response.data.error);
                    appDispatch(logout());
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchRefreshToken();

        const addStateUpdateListener = (key: string) => {
            if (typeof chrome.storage === "undefined") {
                console.log("[web]");
                return;
            }
            console.log("[extension]");
            chrome.storage.onChanged.addListener((changes, _) => {
                for (let k of Object.keys(changes)) {
                    if (k === key) {
                        const bookmark = diff(
                            changes[key].oldValue,
                            changes[key].newValue
                        );
                        if (bookmark) {
                            appDispatch(setBookmarksFromStorage());
                        }
                        break;
                    }
                }
            });
        };

        addStateUpdateListener("bookmarks");
    }, []);

    return (
        <>
            <KeyListener {...{ searchRef }} />
            <BookmarkEditModal />
            <AuthModal />
            <div className="h-full w-[95%] xl:w-[1280px] 2xl:w-[1538px]">
                <div className="h-full grid grid-cols-4 text-white font-white w-full">
                    {/* left */}
                    <Navbar />
                    {/* middle */}
                    <div
                        className={`border-x border-dark-gray col-span-2 h-full`}
                    >
                        <MidPanel />
                    </div>
                    {/* right */}
                    <div className="p-4">
                        <Input {...{ searchRef }} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
