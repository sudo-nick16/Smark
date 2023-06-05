import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { openSideBar, RootState, useAppDispatch } from "../store/index";
import { BookmarkListWithChildren } from "../types";
import useAxios from "../utils/useAxios";
import sideBar from "../assets/sidebar.png";
import BookmarkItem from "./BookmarkItem";
import Button from "./Button";
import { useSelector } from "react-redux";
import useSnackBarUtils from "../utils/useSnackBar";
import axios from "axios";
import { SERVER_URL } from "../constants";

type ForeignListProps = {
  className?: string;
};

const ForeignList: React.FC<ForeignListProps> = ({ className = "" }) => {
  const params = useParams();
  const api = useAxios();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(true);
  const appDispatch = useAppDispatch();
  const { showError, showSuccess } = useSnackBarUtils();
  const [showModal, setShowModal] = useState(false);
  const bookmarks = useSelector<RootState, RootState["bookmarks"]["bookmarks"]>(
    (state) => state.bookmarks.bookmarks
  );
  const [newName, setNewName] = useState("");
  const [bookmarkList, setBookmarkList] = useState<BookmarkListWithChildren>({
    _id: "",
    title: "",
    public: false,
    children: [],
    userId: "",
  });

  const addList = async () => {
    const present = bookmarks.find(
      (bm) => bm.title.trim() === bookmarkList.title.trim()
    );
    if (present) {
      showError("List already exists");
      setShowModal(true);
    }
  };

  useEffect(() => {
    const fetchList = async () => {
      const { userId, listId } = params;
      if (userId && listId) {
        const res = await axios.get(`${SERVER_URL}/bookmarks/${userId}/${listId}`);
        if (res.data.error) {
          console.log(res.data.error);
          setNotFound(true);
          setLoading(false);
          return;
        }
        setBookmarkList(res.data.bookmarkList);
        setNewName(res.data.bookmarkList.title);
        setNotFound(false);
        setLoading(false);
      }
    };
    fetchList();
  }, []);
  console.log({ params });
  return (
    <>
      {/* modal */}
      {showModal && (
        <div
          className={`p-4 bg-black fixed top-1/2 s-shadow rounded-lg z-30 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col max-w-[19rem] xxs:max-w-[20rem]`}
        >
          <p className="text-base font-bold">
            List with the same name already exists. Enter a new name for the
            list.
          </p>
          <input
            onChange={(e) => setNewName(e.target.value)}
            value={newName}
            className="bg-black mt-3 outline-none border border-white px-3 py-2 rounded-lg"
          />
          <div className="flex w-full justify-center mt-4">
            <Button>Import</Button>
          </div>
        </div>
      )}
      <div
        className={`${className} w-full relative h-[100dvh] max-h-[100dvh] flex flex-col`}
      >
        <div className="w-full h-[4.5rem] px-4 flex items-center justify-start border-b border-dark-gray">
          <img
            src={sideBar}
            alt="delete"
            className="h-8 w-8 mr-2 hover:opacity-90 cursor-pointer lg:hidden"
            onClick={() => appDispatch(openSideBar())}
          />
          <h1 className="font-bold text-xl">
            {notFound ? 404 : bookmarkList.title}
          </h1>
        </div>
        <div className="h-full overflow-y-auto w-full flex flex-col">
          {loading ? (
            <h1 className="font-extrabold text-3xl h-full w-full flex items-center justify-center">
              Finding...
            </h1>
          ) : notFound ? (
            <h1 className="font-extrabold text-3xl h-full w-full flex items-center justify-center">
              Could not find the list.
            </h1>
          ) : (
            <div
              className="h-[calc(100dvh-9rem)] 2xl:h-full overflow-y-auto w-full flex flex-col"
              id="urllist-container"
            >
              {bookmarkList.children.map((bm, i) => {
                return <BookmarkItem showControls={false} bookmark={bm} key={i} />;
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForeignList;
