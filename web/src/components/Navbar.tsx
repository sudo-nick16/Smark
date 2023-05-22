import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import smark from "../assets/smark.png";
import {
    RootState,
    setCurrentList,
    setInput,
    setInputMode,
    useAppDispatch,
} from "../store/index";
import { BookmarkList } from "../types";
import Profile from "./Profile";

type NavbarProps = {
    className?: string;
};

const Navbar: React.FC<NavbarProps> = ({ className }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const appDispatch = useAppDispatch();
    const input = useSelector<RootState, RootState["inputInfo"]>(
        (state) => state.inputInfo
    );
    const bookmarkList = useSelector<RootState, RootState["bookmarks"]>(
        (state) => state.bookmarks
    );
    console.log({ bookmarkList });
    const currentList = useSelector<RootState, RootState["currentList"]>(
        (state) => state.currentList
    );

    const handleClick = (ele: BookmarkList) => {
        appDispatch(setCurrentList(ele.title));
        appDispatch(setInput({ ...input, currentValue: "", mode: "" }));
        if (location.pathname !== "/") {
            console.log("navigating to /");
            navigate("/");
        }
    };

    return (
        <div className={`h-screen px-4 flex flex-col ${className}`}>
            <div className="mt-4 ml-4" onClick={() => navigate("/")}>
                <img src={smark} alt="smark" className="h-10 w-auto" />
            </div>
            <div className="mt-8 w-full h-full max-h-full overflow-y-auto flex flex-col">
                {(input.mode === "sl"
                    ? bookmarkList.filter(
                          (e) =>
                              e.title === "Home" ||
                              e.title
                                  .trim()
                                  .toLowerCase()
                                  .indexOf(input.currentValue.toLowerCase()) !==
                                  -1
                      )
                    : bookmarkList
                ).map((ele, i) => {
                    return (
                        <div
                            onClick={() => handleClick(ele)}
                            key={i}
                            className={`flex items-center py-2 px-4 2xl:py-3
                                ${ele.title === currentList && "bg-light-gray"}
                                text-[1rem] transition-all duration-75 bg-opacity-50
                                w-full hover:bg-dark-gray hover:bg-opacity-70 
                                hover:cursor-pointer rounded-3xl font-semibold`}
                        >
                            {ele.title}
                        </div>
                    );
                })}
            </div>
            <div className="my-4">
                <Profile />
            </div>
        </div>
    );
};

export default Navbar;
