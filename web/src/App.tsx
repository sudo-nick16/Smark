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
  smarkEventsListener,
  useAppDispatch,
} from "./store/index";
import { Bookmark, BookmarkListWithChildren, Event } from "./types";
import useAxios from "./utils/useAxios";
import {
  clearSmarkEvents,
  setBookmarks,
  setBookmarksFromStorage,
} from "./store/asyncActions";
import { useSelector } from "react-redux";
import { getItem, setItem } from "./store/storageApi";
import Input from "./components/Input";
import MidPanel from "./components/MidPanel";
import KeyListener from "./components/KeyListener";
import AuthModal from "./components/AuthModal";
import BookmarkEditModal from "./components/BookmarkEditModal";
import SnackBar from "./components/SnackBar";
import useSnackBarUtils from "./utils/useSnackBar";
import { processEvents } from "./utils/processEvents";

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
  const { showError, showSuccess } = useSnackBarUtils();
  const api = useAxios();
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(setBookmarksFromStorage());

    const fetchMe = async () => {
      const res = await api.get("/me");
      console.log("fetching user", res.data);
      if (!res.data?.error) {
        appDispatch(setUser(res.data.user));
        showSuccess(`welcome back ${res.data.user.name}`);
      }
    };

    const fetchRefreshToken = async () => {
      try {
        const response = await axios.post(
          `${SERVER_URL}/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );
        console.log("refresh token response", response.data);
        if (!response.data?.error && response.data?.accessToken) {
          appDispatch(setAccessToken(response.data.accessToken));
          return response.data.accessToken;
        }
      } catch (err) {
        console.log(err);
      }
      appDispatch(logout());
      return "";
    };

    const fetchBookmarks = async () => {
      const res = await api.get("/bookmarks");

      if (res.data?.bookmarks) {
        const bm = await processEvents(res.data.bookmarks);
        appDispatch(setBookmarks(bm));
        showSuccess("Bookmarks fetched and processed.");
        return;
      }
      showError("Couldn't fetch from api.");
    };

    const initStateFromApi = async () => {
      const token = await fetchRefreshToken();
      if (!token) {
        return;
      }
      await fetchMe();
      await fetchBookmarks();
    };

    initStateFromApi();

    const addStateUpdateListener = <T,>(
      key: string,
      callback: (oldValue: T, newValue: T) => void
    ) => {
      if (typeof chrome.storage === "undefined") {
        return;
      }
      chrome.storage.onChanged.addListener((changes, _) => {
        for (let k of Object.keys(changes)) {
          if (k === key) {
            callback(changes[key].oldValue, changes[key].newValue);
            break;
          }
        }
      });
    };

    addStateUpdateListener<BookmarkListWithChildren[]>(
      "bookmarks",
      async (oldValue, newValue) => {
        if (!oldValue || !newValue) {
          return;
        }
        const bookmark = diff(oldValue, newValue);
        if (bookmark) {
          let mutex = await getItem<boolean>("bookmark_mutex", false);
          while (mutex) {
            mutex = await getItem<boolean>("bookmark_mutex", false);
            continue;
          }
          await setItem<boolean>("bookmark_mutex", false);
          appDispatch(setBookmarksFromStorage());
        }
      }
    );

    const setDefaultListAtStartup = async () => {
      const list = await getItem<string>("defaultList", "Home");
      appDispatch(setDefaultList(list));
    };

    setDefaultListAtStartup();

    const unsubscribe = smarkEventsListener.startListening({
      predicate: (action) => {
        if (
          action.type.startsWith("bookmark") &&
          action.type.endsWith("fulfilled")
        ) {
          return true;
        }
        return false;
      },
      effect: async (action) => {
        console.log({ action });
        const events = await getItem<Event[]>("smark_events", []);
        if (events.length === 0) {
          return;
        }
        const res = await api.post("/sync", { events });
        if (!res.data.error) {
          appDispatch(clearSmarkEvents());
        }
      },
    });

    return () => {
      unsubscribe();
    };
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
