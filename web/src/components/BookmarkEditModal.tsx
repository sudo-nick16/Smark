import React, { useState } from "react";
import { useSelector } from "react-redux";
import { updateBookmark } from "../store/asyncActions";
import {
  closeBookmarkModal,
  RootState,
  setBookmarkTitle,
  setBookmarkUrl,
  useAppDispatch,
} from "../store/index";
import OutsideClickWrapper from "./OutsideClickWrapper";

type BookmarkEditModalProps = {};

const BookmarkEditModal: React.FC<BookmarkEditModalProps> = ({ }) => {
  const appDispatch = useAppDispatch();
  const bookmarkModal = useSelector<
    RootState,
    RootState["bookmarkUpdateModal"]
  >((state) => state.bookmarkUpdateModal);
  const [invalidInput, setInvalidInput] = useState({
    url: false,
    title: false,
  });

  return bookmarkModal.isOpen ? (
    <OutsideClickWrapper
      as="div"
      className="fixed bg-black rounded-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 s-shadow flex flex-col z-50 text-white"
      onOutsideClick={() => {
        appDispatch(closeBookmarkModal());
      }}
    >
      <label className="font-bold my-2">Title</label>
      <input
        type="text"
        value={bookmarkModal.title}
        className={`outline-none border-2 ${invalidInput.title ? "border-red-500" : "border-white"
          } bg-transparent text-white p-2 rounded-lg`}
        onChange={(e) => appDispatch(setBookmarkTitle(e.target.value))}
      />
      <label className="font-bold my-2">Url</label>
      <input
        type="text"
        value={bookmarkModal.url}
        className={`outline-none border-2 ${invalidInput.url ? "border-red-500" : "border-white"
          } bg-transparent text-white p-2 rounded-lg`}
        onChange={(e) => appDispatch(setBookmarkUrl(e.target.value))}
      />
      <button
        className="px-6 py-2 bg-white rounded-lg text-black font-bold mt-4"
        onClick={() => {
          if (bookmarkModal.title.trim().length < 1) {
            console.log("Invalid title")
            setInvalidInput((e) => ({ ...e, title: true }));
            return;
          }
          if (bookmarkModal.url.trim().length < 1) {
            console.log("Invalid url")
            setInvalidInput((e) => ({ ...e, url: true }));
            return;
          }
          setInvalidInput({ title: false, url: false });
          appDispatch(
            updateBookmark({
              oldTitle: bookmarkModal.oldTitle,
              newTitle: bookmarkModal.title,
              url: bookmarkModal.url,
              listTitle: bookmarkModal.listTitle,
            })
          );
          appDispatch(closeBookmarkModal());
        }}
      >
        Update
      </button>
    </OutsideClickWrapper>
  ) : null;
};

export default BookmarkEditModal;
