import { useRef, useState } from "react";
import OutsideClickWrapper from "./OutsideClickWrapper";
import bin from "../assets/bin.png";
import sideBar from "../assets/sidebar.png";
import edit from "../assets/edit.png";
import share from "../assets/send.png";
import { useSelector } from "react-redux";
import {
  currentList,
  RootState,
  setCurrentList,
  toggleSideBar,
  useAppDispatch,
} from "../store/index";
import { flushSync } from "react-dom";
import { focusCEElement } from "../utils/focusCEElement";
import { deleteList, updateListTitle } from "../store/asyncActions";

type HeadProps = {};

const Head: React.FC<HeadProps> = ({}) => {
  const title = useSelector((state: RootState) => state.currentList);
  const listTitleRef = useRef<HTMLElement>(null);
  const [editable, setEditable] = useState(false);
  const appDispatch = useAppDispatch();

  const handleTitleBlur = () => {
    if (
      listTitleRef.current?.innerText.trim().toLowerCase() === "home" ||
      listTitleRef.current?.innerText.trim().toLowerCase().indexOf("home") !==
        -1
    ) {
      return;
    }
    appDispatch(
      updateListTitle({
        oldTitle: title,
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
        <img src={sideBar} alt="delete" className="h-8 w-8 mr-2 hover:opacity-90 cursor-pointer lg:hidden" onClick={() => appDispatch(toggleSideBar())} />
        <OutsideClickWrapper
          as={"p"}
          onOutsideClick={() => {
            handleTitleBlur();
          }}
          listenerState={editable}
          className={`font-bold text-lg sm:text-xl px-2 line-clamp-2 ${
            editable ? "border-1 border-white" : ""
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
          {title}
        </OutsideClickWrapper>
      </div>
      <div className="bg-dark-gray flex items-center px-2 min-w-fit py-1 rounded-lg">
        <div
          onClick={() => {
            if (title.trim().toLowerCase() === "home") return;
            appDispatch(deleteList(title));
            appDispatch(setCurrentList("Home"));
          }}
          className="hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer"
        >
          <img src={bin} alt="delete" className="h-4 w-4 mx-2" />
        </div>
        <div
          onClick={() => {
            flushSync(() => {
              setEditable((e) => !e);
            });
            focusCEElement(listTitleRef);
          }}
          className="hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer"
        >
          <img src={edit} alt="edit" className="h-4 w-4 mx-2" />
        </div>
        <div
          onClick={() => {}}
          className="hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer"
        >
          <img src={share} alt="share" className="h-4 w-4 mx-2" />
        </div>
      </div>
    </div>
  );
};

export default Head;
