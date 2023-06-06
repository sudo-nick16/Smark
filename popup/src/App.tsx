import {
  BookmarkListWithChildren,
  Event,
  Bookmark,
  setItem,
  getDefaultList,
  processEvents,
} from "@smark/common";
import { useEffect, useState } from "react";
import smarkIcon from "./assets/smark.png";
import closeBtn from "./assets/close.png";
import useAxios from "./hooks/useAxios";
import getBookmarks from "./utils/getBookmarks";
import getSmarkEvents from "./utils/getSmarkEvents";

function App() {
  const api = useAxios();
  const [bookmarks, setBookmarks] = useState<BookmarkListWithChildren[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    error: boolean;
  }>({
    open: false,
    message: "",
    error: false,
  });
  const [smarkEvents, setSmarkEvents] = useState<Event[]>([]);
  const [tabInfo, setTabInfo] = useState<{
    title: string;
    url: string;
    img: string;
  }>({
    title: "",
    url: "",
    img: "",
  });
  const [list, setList] = useState<string>("");
  const [added, setAdded] = useState<boolean>(false);

  const fetchHandler = async () => {
    const res = await api.get("/bookmarks");
    console.log(res);
    if (res.data.bookmarks) {
      const bm = await processEvents(res.data.bookmarks);
      setBookmarks(bm);
      await setItem("bookmarks", bm);
      showSuccess("fetched successfully");
      return;
    }
  };

  const syncHandler = async () => {
    const res = await api.post("/sync", {
      events: await getSmarkEvents(),
    });
    if (!res.data.error) {
      await setItem("smark_events", []);
      setSmarkEvents([]);
      showSuccess("synced successfully.");
      return;
    }
    showError("couldn't sync.");
  };

  const closeSnackBar = () => {
    setSnackbar({
      open: false,
      error: false,
      message: "",
    });
  };

  const openSnackBar = (message: string, error: boolean = false) => {
    setSnackbar({
      open: true,
      message,
      error,
    });
    setTimeout(() => {
      closeSnackBar();
    }, 1000);
  };

  const showError = (message: string) => {
    openSnackBar(message, true);
  };

  const showSuccess = (message: string) => {
    openSnackBar(message, false);
  };

  const openExtension = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("options/index.html"),
    });
  };

  const addBookmarkHandler = async () => {
    if (added) {
      showError("this bookmark already exists.");
      return;
    }
    if (!tabInfo.title || !tabInfo.url || !list || added) {
      showError("please fill all the fields.");
      return;
    }
    const bookmark: Bookmark = {
      title: tabInfo.title,
      listTitle: list,
      url: tabInfo.url,
      img: tabInfo.img,
      userId: "",
    };
    const addBookmarkEvent: Event = {
      type: "create_bookmark",
      data: {
        title: tabInfo.title,
        listTitle: list,
        url: tabInfo.url,
        img: tabInfo.img,
      },
    };
    console.log({ bookmark, addBookmarkEvent });
    const updatedBookmarks = bookmarks.map((list) => {
      if (list.title === bookmark.listTitle) {
        list.children.push(bookmark);
      }
      return list;
    });
    await setItem("bookmarks", updatedBookmarks);
    await setItem("smark_events", [...smarkEvents, addBookmarkEvent]);
    setBookmarks(updatedBookmarks);
    setSmarkEvents([...smarkEvents, addBookmarkEvent]);
    showSuccess("bookmark added.");
  };

  useEffect(() => {
    setAdded(
      bookmarks
        .find((l) => l.title === list)
        ?.children.find((b) => b.url === tabInfo.url) !== undefined
    );
  }, [bookmarks, list]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab) {
        setTabInfo({
          title: tab.title || "",
          url: tab.url || "",
          img: tab.favIconUrl || "",
        });
      }
    });

    const initState = async () => {
      const bookmarks = await getBookmarks();
      const smarkEvents = await getSmarkEvents();
      const defaultList = await getDefaultList();
      setList(defaultList);
      setBookmarks(bookmarks);
      setSmarkEvents(smarkEvents);
    };

    initState();
  }, []);
  return (
    <>
      <div
        className={`z-50 px-3 py-1 font-bold fixed left-1/2 -translate-x-1/2 flex items-center rounded-xl gap-x-3 max-w-[95%] w-[95%] -top-4 transition-all duration-100 text-black ${
          snackbar.error ? "bg-red-500" : "bg-green-500"
        } ${snackbar.open ? "h-auto top-3" : "h-0"}`}
      >
        <span className="grow line-clamp-2">{snackbar.message}</span>
        <img
          alt="close"
          className="h-3 w-3 cursor-pointer"
          src={closeBtn}
          onClick={closeSnackBar}
        />
      </div>
      <div className="p-4 flex flex-col text-white w-full gap-y-6">
        <div className="flex gap-x-3 items-center font-bold">
          <img
            onClick={openExtension}
            className="h-8 w-auto cursor-pointer"
            alt="smark"
            src={smarkIcon}
          />
          <span
            onClick={syncHandler}
            className={`ml-auto px-3 py-1 w-fit h-fit rounded-xl hover:opacity-90 cursor-pointer ${
              smarkEvents.length > 0 ? "bg-yellow-500" : "bg-green-500"
            }`}
          >
            {smarkEvents.length > 0 ? "sync" : "synced"}
          </span>
          <span
            onClick={fetchHandler}
            className="px-3 py-1 w-fit h-fit rounded-xl bg-dark-gray border-2 border-light-gray hover:opacity-90 cursor-pointer"
          >
            fetch
          </span>
        </div>
        <input
          className="outline-none bg-transparent rounded-xl border-2 border-dark-gray font-medium text-base px-3 py-2"
          value={tabInfo.title}
          placeholder="title"
          onChange={(e) => setTabInfo((t) => ({ ...t, title: e.target.value }))}
        />
        <input
          className="outline-none bg-transparent rounded-xl border-2 border-dark-gray font-medium text-base px-3 py-2"
          value={tabInfo.url}
          placeholder="url"
          onChange={(e) => setTabInfo((t) => ({ ...t, url: e.target.value }))}
        />
        <div className="flex gap-x-3 w-full justify-between font-bold">
          <select
            className="outline-none bg-transparent border-2 border-dark-gray rounded-xl px-3 py-2 grow max-w-[75%]"
            onChange={(e) => setList(e.target.value)}
          >
            {bookmarks.map((l) => {
              return (
                <option
                  className="bg-black hover:bg-black"
                  value={l.title}
                  selected={l.title === list}
                >
                  {l.title}
                </option>
              );
            })}
          </select>
          <div
            onClick={addBookmarkHandler}
            className={`flex items-center justify-center 
                    font-bold cursor-pointer rounded-xl px-3 py-1 hover:opacity-9 ${
                      added
                        ? "cursor-not-allowed text-white bg-red-500"
                        : "bg-white text-black"
                    }`}
          >
            {added ? "Added" : "Add"}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
