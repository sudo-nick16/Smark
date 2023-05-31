import { useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import axios from "axios";
import { SERVER_URL } from "./constants";
import {
    logout,
    RootState,
    setAccessToken,
    setDefaultList,
    setUser,
    useAppDispatch,
} from "./store/index";
import { Bookmark, BookmarkListWithChildren } from "./types";
import useAxios from "./utils/useAxios";
import { setBookmarks, setBookmarksFromStorage } from "./store/asyncActions";
import { useSelector } from "react-redux";
import { getItem, setItem } from "./store/storageApi";
import Input from "./components/Input";
import MidPanel from "./components/MidPanel";
import { isChrome } from "./utils/isChrome";
import KeyListener from "./components/KeyListener";
import AuthModal from "./components/AuthModal";
import BookmarkEditModal from "./components/BookmarkEditModal";
import { useLocation, useNavigate } from "react-router-dom";
import SnackBar from "./components/SnackBar";
import useSnackBarUtils from "./utils/useSnackBar";

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
    const { showError, showSuccess } = useSnackBarUtils();

    const appDispatch = useAppDispatch();
    const bookmarks = useSelector<RootState, BookmarkListWithChildren[]>(
        (state) => state.bookmarks.bookmarks
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
                "bookmarks",
                []
            );
            const query = params.query;
            if (!query) {
                navigate("/");
                return;
            }
            if (params.listTitle) {
                const listTitle = params.listTitle;
                const bookmark = localBookmarks!
                    .find(
                        (list) =>
                            list.title
                                .trim()
                                .toLowerCase()
                                .indexOf(listTitle.trim().toLowerCase()) !== -1
                    )
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

        const fetchFromApi = async () => {
            console.log("fetching");
            const res = await api.get("/bookmarks");
            console.log(res);
            if (res.data.bookmarks) {
                appDispatch(setBookmarks(res.data.bookmarks));
                showSuccess("Bookmarks fetched.");
                return;
            }
        };

        if (isChrome()) {
            appDispatch(setBookmarksFromStorage());
            showSuccess("Bookmarks synced from local storage.");
        } else {
            fetchFromApi();
        }

        const ensureStorage = async (key: string, defaultValue: any) => {
            const val = await getItem<any>(key, defaultValue);
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

        const setDefaultListAtStartup = async () => {
            const list = await getItem<string>("defaultList", "Home");
            appDispatch(setDefaultList(list));
        };

        setDefaultListAtStartup();
    }, []);

    return (
        <>
            <KeyListener {...{ searchRef }} />
            <BookmarkEditModal />
            <AuthModal />
            <SnackBar />
            <div className="w-screen mx-auto">
                <div className="flex text-white font-white w-full max-w-screen">
                    {/* left */}
                    <Navbar className="" />
                    {/* middle */}
                    <div className="grow flex h-[100dvh] flex-col 2xl:flex-row overflow-hidden">
                        <MidPanel className="" />
                        {/* right */}
                        <Input
                            {...{ searchRef }}
                            className="border 2xl:w-[23rem] border-dark-gray 2xl:border-0"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
