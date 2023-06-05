import { useSelector } from "react-redux";
import { RootState } from "../store/index";
import { BookmarkListWithChildren } from "../types";
import BookmarkItem from "./BookmarkItem";
import Head from "./Head";

const BookmarkList: React.FC<{ className?: string }> = ({ className = "" }) => {
  let bookmarks = useSelector<RootState, BookmarkListWithChildren[]>(
    (state) => state.bookmarks.bookmarks
  );
  const currentList = useSelector<RootState, string>(
    (state) => state.currentList
  );
  const input = useSelector<RootState, RootState["inputInfo"]>(
    (state) => state.inputInfo
  );

  const getBookmarks = () => {
    if (input.mode === "su") {
      return (
        bookmarks
          .find((b) => b.title === currentList)
          ?.children.filter(
            (b) =>
              b.title
                ?.toLowerCase()
                .indexOf(input.currentValue.trim().toLowerCase()) !== -1 ||
              b.url
                .toLowerCase()
                .indexOf(input.currentValue.trim().toLowerCase()) !== -1
          ) || []
      );
    } else if (input.mode === "sa") {
      return (
        bookmarks
          .map((b) => b.children).flat().filter(
            (b) =>
              b.title
                .toLowerCase()
                .indexOf(input.currentValue.trim().toLowerCase()) !== -1 ||
              b.url
                .toLowerCase()
                .indexOf(input.currentValue.trim().toLowerCase()) !== -1
          ) || []
      );
    }
    return bookmarks.find((b) => b.title === currentList)?.children || [];
  };

  return (
    <div
      className={`${className} relative 2xl:h-[100dvh] 2xl:max-w-[75%] flex grow flex-col`}
    >
      <Head />
      <div
        className="h-[calc(100dvh-9rem)] 2xl:h-full overflow-y-auto w-full flex flex-col"
        id="urllist-container"
      >
        {getBookmarks().map((e, i) => (
          <BookmarkItem index={i} bookmark={e} key={i} />
        ))}
      </div>
    </div>
  );
};

export default BookmarkList;
