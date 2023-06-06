import { useRef, useState } from "react";
import OutsideClickWrapper from "./OutsideClickWrapper";
import bin from "../assets/bin.png";
import sideBar from "../assets/sidebar.png";
import publicIcon from "../assets/public.png";
import privateIcon from "../assets/private.png";
import edit from "../assets/edit.png";
import share from "../assets/send.png";
import { useSelector } from "react-redux";
import {
  RootState,
  setCurrentList,
  toggleSideBar,
  useAppDispatch,
} from "../store/index";
import { flushSync } from "react-dom";
import { focusCEElement } from "../utils/focusCEElement";
import {
  deleteList,
  updateListTitle,
  updateListVisibility,
} from "../store/asyncActions";
import useSnackBarUtils from "../utils/useSnackBar";
import useAxios from "../utils/useAxios";

type HeadProps = {};

const Head: React.FC<HeadProps> = ({}) => {
  const api = useAxios();
  const { showSuccess, showError } = useSnackBarUtils();
  const currentTitle = useSelector<RootState, string>(
    (state) => state.currentList
  );
  const bookmarks = useSelector<RootState, RootState["bookmarks"]["bookmarks"]>(
    (state) => state.bookmarks.bookmarks
  );
  const listTitleRef = useRef<HTMLElement>(null);
  const [editable, setEditable] = useState(false);
  const appDispatch = useAppDispatch();

  const toggleListVisibility = () => {
    if (currentTitle.trim().toLowerCase() === "home") {
      showError("Home list can't be public");
      return;
    }
    appDispatch(updateListVisibility(currentTitle));
  };

  const getShareableLink = async () => {
    const res = await api.get(`/bookmarks/share/${currentTitle}`);
    console.log(res);
    if (res.data.shareLink) {
      await navigator.clipboard.writeText(res.data.shareLink);
      showSuccess("Link copied to clipboard");
      return;
    }
    showError("could not get shareable link");
  };

  const handleTitleBlur = () => {
    if (currentTitle.trim().toLowerCase() === "home") {
      setEditable(false);
      return;
    }
    appDispatch(
      updateListTitle({
        oldTitle: currentTitle,
        newTitle: listTitleRef.current?.innerText || "",
      })
    );
    appDispatch(setCurrentList(listTitleRef.current?.innerText!));
    listTitleRef.current!.blur();
    setEditable(false);
  };

  return (
    <div className="w-full px-4 min-h-[4.5rem] max-h-[4.5rem] h-[4.5rem] flex items-center justify-between border-b border-dark-gray">
      <div className="flex items-center">
        <img
          src={sideBar}
          alt="delete"
          className="h-8 w-8 mr-2 hover:opacity-90 cursor-pointer lg:hidden"
          onClick={() => appDispatch(toggleSideBar())}
        />
        <OutsideClickWrapper
          as={"p"}
          onOutsideClick={() => {
            handleTitleBlur();
          }}
          listenerState={editable}
          className={`font-bold text-lg sm:text-xl px-2 outline-none rounded-md break-all line-clamp-2 ${
            editable ? "border-2 border-white" : ""
          }`}
          ref={listTitleRef}
          contentEditable={editable}
          suppressContentEditableWarning
          suppressHydrationWarning
          onKeyDown={(e) => {
            console.log(e.key, e.shiftKey, e.currentTarget.innerText);
            if (e.key === "Enter" && !e.shiftKey) {
              handleTitleBlur();
            }
          }}
        >
          {currentTitle}
        </OutsideClickWrapper>
      </div>
      <div className="bg-dark-gray flex items-center px-2 min-w-fit py-1 rounded-lg">
        <div
          onClick={() => {
            if (currentTitle.trim().toLowerCase() === "home") return;
            appDispatch(deleteList(currentTitle));
            appDispatch(setCurrentList("Home"));
          }}
          className="hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer"
        >
          <img src={bin} alt="delete" className="h-4 w-4 mx-2" />
        </div>
        <div
          onClick={toggleListVisibility}
          className="hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer"
        >
          {bookmarks.find((list) => list.title === currentTitle)?.public ? (
            <img src={publicIcon} alt="delete" className="h-4 w-4 mx-2" />
          ) : (
            <img src={privateIcon} alt="delete" className="h-4 w-4 mx-2" />
          )}
        </div>
        <div
          onClick={(e) => {
            if (!editable) {
              flushSync(() => {
                setEditable(true);
              });
              focusCEElement(listTitleRef);
              return;
            }
            setEditable(false);
          }}
          className="hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer"
        >
          <img src={edit} alt="edit" className="h-4 w-4 mx-2" />
        </div>
        <div
          onClick={getShareableLink}
          className="hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer"
        >
          <img src={share} alt="share" className="h-4 w-4 mx-2" />
        </div>
      </div>
    </div>
  );
};

export default Head;
