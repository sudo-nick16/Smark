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
import { setBookmarks, setBookmarksFromStorage } from "./store/asyncActions";
import { useSelector } from "react-redux";
import { getItem } from "./store/storageApi";
import Input from "./components/Input";
import MidPanel from "./components/MidPanel";
import KeyListener from "./components/KeyListener";
import AuthModal from "./components/AuthModal";
import BookmarkEditModal from "./components/BookmarkEditModal";
import SnackBar from "./components/SnackBar";
import useSnackBarUtils from "./utils/useSnackBar";
import { isChrome } from "./utils/isChrome";
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
  const api = useAxios();
  const { showError, showSuccess } = useSnackBarUtils();

  const appDispatch = useAppDispatch();
  const bookmarksState = useSelector<RootState, RootState["bookmarks"]>(
    (state) => state.bookmarks
  );

  console.log({ bookmarksState });

  useEffect(() => {
    appDispatch(setBookmarksFromStorage());

    const initStateFromApi = async () => {
      console.log("fetching");
      const res = await api.get("/bookmarks");
      console.log(res);
      if (res.data.bookmarks) {
        const bm = await processEvents(res.data.bookmarks);
        appDispatch(setBookmarks(bm));
        showSuccess("Bookmarks fetched and processed.");
        return;
      }
      showError("Couldn't fetch from api.");
    };

    appDispatch(setBookmarksFromStorage());

    if (!isChrome()) {
      initStateFromApi();
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
      (oldValue, newValue) => {
        const bookmark = diff(oldValue, newValue);
        if (bookmark) {
          appDispatch(setBookmarksFromStorage());
        }
      }
    );
    addStateUpdateListener<Event[]>("smark_events", (oldValue, newValue) => {
      if (oldValue.length !== newValue.length) {
        appDispatch(setBookmarksFromStorage());
      }
    });

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
