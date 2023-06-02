import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import smark from "../assets/smark.png";
import sideBar from "../assets/sidebar.png";
import {
    closeSideBar,
    RootState,
    setCurrentList,
    setInput,
    toggleSideBar,
    useAppDispatch,
} from "../store/index";
import { BookmarkList } from "../types";
import Profile from "./Profile";
import OutsideClickWrapper from "./OutsideClickWrapper";
import useMediaQuery from "../hooks/useMediaQuery";

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
    const bookmarkList = useSelector<
        RootState,
        RootState["bookmarks"]["bookmarks"]
    >((state) => state.bookmarks.bookmarks);
    console.log({ bookmarkList });
    const currentList = useSelector<RootState, RootState["currentList"]>(
        (state) => state.currentList
    );

    const handleClick = (ele: BookmarkList) => {
        appDispatch(setCurrentList(ele.title));
        appDispatch(setInput({ ...input, currentValue: "", mode: "" }));
        appDispatch(toggleSideBar());
        if (location.pathname !== "/") {
            console.log("navigating to /");
            navigate("/");
        }
    };

    const visible = useSelector<RootState, boolean>(
        (state) => state.modalBars.sideBar
    );

    const matches = useMediaQuery("(max-width: 1024px)");

    return (
        <OutsideClickWrapper
            listenerState={matches && visible}
            onOutsideClick={() => appDispatch(closeSideBar())}
            as="div"
            className={`h-[100dvh] w-[20rem] min-w-[20rem] flex flex-col fixed bg-black z-10 shadow-xl transition-all duration-100 shadow-dark-gray ${
                !visible ? "-translate-x-full" : ""
            } lg:translate-x-0 lg:shadow-none lg:static ${className}`}
        >
            <div className="ml-4 h-[4.5rem] flex px-4 items-center justify-between">
                <img
                    onClick={() => navigate("/")}
                    src={smark}
                    alt="smark"
                    className="h-10 w-auto cursor-pointer"
                />
                <img
                    src={sideBar}
                    alt="delete"
                    className="h-8 w-8 mr-2 hover:opacity-90 cursor-pointer lg:hidden"
                    onClick={() => appDispatch(toggleSideBar())}
                />
            </div>
            <div className="mt-2 py-4 px-4 grow w-full max-h-full overflow-y-auto flex flex-col">
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
                            className={`flex !text-lg items-center py-2 px-4 2xl:py-[10px]
                                ${ele.title === currentList && "bg-light-gray"}
                               transition-all duration-75 bg-opacity-50
                                w-full hover:bg-dark-gray hover:bg-opacity-70 
                                hover:cursor-pointer rounded-3xl font-semibold`}
                        >
                            {ele.title}
                        </div>
                    );
                })}
            </div>
            <Profile />
        </OutsideClickWrapper>
    );
};

export default Navbar;
