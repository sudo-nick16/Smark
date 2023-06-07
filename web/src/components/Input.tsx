import React from "react";
import { useSelector } from "react-redux";
import { createBookmark, createList } from "../store/asyncActions";
import {
  RootState,
  setInput,
  setInputValue,
  useAppDispatch,
} from "../store/index";

type InputProps = {
  searchRef: React.RefObject<HTMLInputElement>;
  className?: string;
};

const Input: React.FC<InputProps> = ({ searchRef, className = "" }) => {
  const inputInfo = useSelector<
    RootState,
    { mode: string; currentValue: string }
  >((state) => state.inputInfo);
  const appDispatch = useAppDispatch();

  const currentList = useSelector<RootState, RootState["currentList"]>(
    (state) => state.currentList
  );

  const cmdMap = {
    su: "search urls in the current list",
    sa: "search urls in all the lists",
    sl: "search lists",
    cu: "create url",
    cl: "create list",
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const str = event.target.value.trimStart();
    if (str.length == 3) {
      // @ts-ignore
      if (cmdMap[str.toLowerCase().trimEnd()]) {
        appDispatch(
          setInput({
            mode: str.toLowerCase().trimEnd(),
            currentValue: "",
          })
        );
        return;
      }
    }
    appDispatch(setInputValue(str));
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      switch (inputInfo.mode.toLowerCase()) {
        case "cu": {
          if (inputInfo.currentValue.trim().length === 0) {
            return;
          }
          appDispatch(
            createBookmark({
              listTitle: currentList,
              url: inputInfo.currentValue,
              title: inputInfo.currentValue,
              img: "",
            })
          );
          appDispatch(setInputValue(""));
          break;
        }
        case "cl": {
          if (inputInfo.currentValue.trim().toLowerCase() === "home") {
            break;
          }
          appDispatch(createList(inputInfo.currentValue));
          appDispatch(setInputValue(""));
          break;
        }
        case "su": {
          searchRef.current!.blur();
          break;
        }
        case "sl": {
          searchRef.current!.blur();
          break;
        }
        case "sa": {
          searchRef.current!.blur();
          appDispatch(setInputValue(""));
          break;
        }
        default:
          break;
      }
      searchRef.current!.blur();
    }
  };

  return (
    <div className={`w-full z-20 bg-black p-4 h-[4.5rem] 2xl:h-auto flex flex-col ${className}`}>
      <div className="s-shadow rounded-3xl w-full h-auto outline-none p-2 flex">
        <div
          className="bg-dark-gray text-base max-w-fit px-3 w-12 text-center rounded-2xl"
          id="search-type"
        >
          /{inputInfo.mode}
        </div>
        <input
          ref={searchRef}
          type="text"
          name="search"
          className="px-2 h-full text-base outline-none bg-transparent w-full"
          value={inputInfo.currentValue}
          onChange={(e) => handleInput(e)}
          onKeyUp={(e) => handleKey(e)}
        />
      </div>
      <div className="mt-4 w-full bg-dark-gray bg-opacity-50 rounded-lg hidden 2xl:flex flex-col pb-2 mx-auto">
        <h4 className="w-full text-sm text-center my-2 font-bold">Commands</h4>
        {Object.keys(cmdMap).map(
          // @ts-ignore
          (k: keyof typeof cmdMap, i: number) => (
            <div
              className="px-3 w-full text-sm max-w-full grid grid-cols-6 my-1"
              key={i}
            >
              <span className="bg-md-gray w-8 text-center rounded-md h-fit bg-opacity-30">
                /{k}
              </span>
              <span className="col-span-5 truncate w-fit max-w-full">
                {cmdMap[k]}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};
export default Input;
