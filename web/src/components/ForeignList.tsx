import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { openSideBar, useAppDispatch } from "../store/index";
import { BookmarkListWithChildren } from "../types";
import useAxios from "../utils/useAxios";
import sideBar from "../assets/sidebar.png";
import BookmarkItem from "./BookmarkItem";
import Button from "./Button";

type ForeignListProps = {
  className?: string;
};

const ForeignList: React.FC<ForeignListProps> = ({ className = "" }) => {
  const params = useParams();
  const api = useAxios();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const appDispatch = useAppDispatch();

  const [bookmarkList, setBookmarkList] = useState<BookmarkListWithChildren>({
    _id: "",
    title: "",
    public: false,
    children: [],
    userId: "",
  });

  useEffect(() => {
    const fetchList = async () => {
      const { userId, listId } = params;
      if (userId && listId) {
        const res = await api.get(`/bookmarks/${userId}/${listId}`);
        if (res.data.error) {
          console.log(res.data.error);
          setLoading(false);
          setNotFound(true);
          return;
        }
        setBookmarkList(res.data.bookmarkList);
        setLoading(false);
      }
    };
    fetchList();
  }, []);
  console.log({ params });
  return (
    <>
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
          {!notFound && <Button className="ml-auto">Import</Button>}
        </div>
        <div className="h-full overflow-y-auto p-4 md:p-10 w-full flex flex-col">
          {loading ? (
            <h1 className="font-extrabold text-3xl h-full w-full flex items-center justify-center">
              Finding..
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
                return <BookmarkItem index={i} bookmark={bm} key={i} />;
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForeignList;
