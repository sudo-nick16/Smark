import sideBar from "../assets/sidebar.png";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
    logout,
    RootState,
    setDefaultList,
    toggleSideBar,
    useAppDispatch,
} from "../store/index";
import { BookmarkListWithChildren } from "../types";
import { isChrome } from "../utils/isChrome";
import useAxios from "../utils/useAxios";
import useSnackBarUtils from "../utils/useSnackBar";

type AccountProps = {
    className?: string;
};

const Account: React.FC<AccountProps> = ({ className = "" }) => {
    const api = useAxios();
    const { showSuccess, showError } = useSnackBarUtils();
    const appDispatch = useAppDispatch();
    const bookmarks = useSelector<RootState, RootState["bookmarks"]>(
        (state) => state.bookmarks
    );
    const defaultList = useSelector<RootState, string>(
        (state) => state.defaultList
    );
    const auth = useSelector<RootState, RootState["auth"]>(
        (state) => state.auth
    );

    const logoutHandler = async () => {
        try {
            const res = await api.post(
                "/logout",
                {},
                { withCredentials: true }
            );
            if (res.data.error) {
                showError(res.data.error);
                return;
            }
            showSuccess("Logged out successfully");
            appDispatch(logout());
        } catch (e) {
            showError("Couldn't logout");
        }
    };

    const handleDropdownChange = (list: string) => {
        console.log({ list });
        appDispatch(setDefaultList(list));
    };
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
                        onClick={() => appDispatch(toggleSideBar())}
                    />
                    <h1 className="font-bold text-xl">Account</h1>
                </div>
                <div className="h-full overflow-y-auto p-4 md:p-10 w-full flex flex-col">
                    <div className="grid grid-cols-3 grid-flow-row max-w-[25rem] gap-2 md:gap-4 p-4 w-full md:w-3/4 mx-auto text-base font-semibold">
                        <span className="flex items-center">Name</span>
                        <input
                            type="text"
                            value={auth.user?.name}
                            className="bg-transparent border border-md-gray rounded-md text-base col-span-2 py-2 px-2"
                        />

                        <span className="flex items-center">Email</span>
                        <input
                            type="text"
                            value={auth.user?.email}
                            className="bg-transparent border border-md-gray rounded-md text-base col-span-2 py-2 px-2"
                        />

                        {isChrome() && (
                            <>
                                <span>Default list</span>
                                <select
                                    onChange={(e) =>
                                        handleDropdownChange(e.target.value)
                                    }
                                    className="text-white bg-transparent border-0 outline-none"
                                >
                                    {bookmarks.bookmarks.map((bookmark, index) => {
                                        return (
                                            <option
                                                className="bg-black"
                                                selected={
                                                    bookmark.title ===
                                                    defaultList
                                                }
                                                key={index}
                                                value={bookmark.title}
                                            >
                                                {bookmark.title}
                                            </option>
                                        );
                                    })}
                                </select>
                            </>
                        )}
                        <div
                            onClick={logoutHandler}
                            className="bg-dark-gray px-4 py-2 flex items-center justify-center rounded-xl cursor-pointer hover:opacity-90"
                        >
                            Logout
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Account;
