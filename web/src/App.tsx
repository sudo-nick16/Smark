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
import { Bookmark, BookmarkListWithChildren, Event } from "./types";
import useAxios from "./utils/useAxios";
import {
  createBookmark,
  createList,
  deleteBookmark,
  deleteList,
  setBookmarks,
  setBookmarksFromStorage,
  updateBookmark,
  updateListTitle,
  updateListVisibility,
} from "./store/asyncActions";
import { useSelector } from "react-redux";
import { getItem } from "./store/storageApi";
import Input from "./components/Input";
import MidPanel from "./components/MidPanel";
import KeyListener from "./components/KeyListener";
import AuthModal from "./components/AuthModal";
import BookmarkEditModal from "./components/BookmarkEditModal";
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
  const { showError, showSuccess } = useSnackBarUtils();

  const appDispatch = useAppDispatch();
  const bookmarksState = useSelector<RootState, RootState["bookmarks"]>(
    (state) => state.bookmarks
  );

  console.log({ bookmarksState });

  useEffect(() => {
    const processEvents = async () => {
      let bookmarks = await getItem<BookmarkListWithChildren[]>(
        "bookmarks",
        []
      );
      const pendingEvents = await getItem<Event[]>("smark_events", []);
      for (let event of pendingEvents) {
        switch (event.type) {
          case "create_bookmark": {
            const data = event.data;
            bookmarks.forEach((l) => {
              if (l.title.trim() === data.listTitle.trim()) {
                l.children.push({
                  title: data.title,
                  url: data.url,
                  img: data.img,
                  listTitle: data.listTitle,
                  userId: "",
                });
              }
            });
            break;
          }
          case "update_bookmark": {
            const data = event.data;
            bookmarks.forEach((list) => {
              if (list.title.trim() === data.listTitle.trim()) {
                list.children.forEach((bookmark) => {
                  if (bookmark.title.trim() === data.oldTitle.trim()) {
                    bookmark.title = data.newTitle.trim();
                    bookmark.url = data.url.trim();
                  }
                });
              }
            });
            break;
          }
          case "delete_bookmark": {
            const data = event.data;
            bookmarks.forEach((list) => {
              if (list.title.trim() === data.listTitle.trim()) {
                list.children = list.children.filter(
                  (b) => b.title.trim() !== data.title.trim()
                );
              }
            });
            break;
          }
          case "create_list": {
            bookmarks.push({
              title: event.data.title,
              children: [],
              public: false,
              userId: "",
            });
            break;
          }
          case "update_list": {
            const data = event.data;
            bookmarks.forEach((list) => {
              if (list.title.trim() === data.oldTitle.trim()) {
                list.title = data.newTitle;
              }
            });
            break;
          }
          case "delete_list": {
            const data = event.data;
            bookmarks = bookmarks.filter(
              (list) => list.title.trim() !== data.title.trim()
            );
            break;
          }
          case "update_list_visibility": {
            const data = event.data;
            bookmarks.forEach((list) => {
              if (list.title.trim() === data.title.trim()) {
                list.public = !list.public;
              }
            });
            break;
          }
          default: {
            console.log("unknown event type");
          }
        }
      }
      appDispatch(setBookmarks(bookmarks));
    };

    appDispatch(setBookmarksFromStorage());
    processEvents();

    const initStateFromApi = async () => {
      console.log("fetching");
      const res = await api.get("/bookmarks");
      console.log(res);
      if (res.data.bookmarks) {
        appDispatch(setBookmarks(res.data.bookmarks));
        showSuccess("Bookmarks fetched.");
        processEvents();
        return;
      }
      showError("Couldn't fetch from api.");
    };

    appDispatch(setBookmarksFromStorage());
    initStateFromApi();

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
            const bookmark = diff(changes[key].oldValue, changes[key].newValue);
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
