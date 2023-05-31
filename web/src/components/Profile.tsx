import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    logout,
    RootState,
    toggleAuthModal,
    toggleSideBar,
    useAppDispatch,
} from "../store";
import { clearSmarkEvents, setBookmarks } from "../store/asyncActions";
import { getItem, setItem } from "../store/storageApi";
import useAxios from "../utils/useAxios";
import useSnackBarUtils from "../utils/useSnackBar";

type ProfileProps = {};

type TagProps = {
    onClick: () => void;
    title: string;
    className?: string;
};

const Tag = ({ onClick, title, className = "" }: TagProps) => {
    return (
        <div
            onClick={onClick}
            className={`s-shadow cursor-pointer bg-dark-gray font-bold rounded-xl flex justify-center items-center px-2 ${className}`}
        >
            {title}
        </div>
    );
};

const Profile: React.FC<ProfileProps> = () => {
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();
    const api = useAxios();
    const { showError, showSuccess } = useSnackBarUtils();

    const selfRef = useRef<HTMLDivElement>(null);
    const authState = useSelector<RootState, RootState["auth"]>(
        (state) => state.auth
    );
    const synced = useSelector<RootState, boolean>(
        (state) => state.bookmarks.events.length === 0
    );

    const toggleModal = () => {
        console.log("toggle");
        appDispatch(toggleAuthModal());
        appDispatch(toggleSideBar());
    };

    const goToAccount = () => {
        navigate("/my-account");
        appDispatch(toggleSideBar());
    };

    const syncBookmarks = async () => {
        const events = await getItem("smark_events", []);
        console.log({ events });
        const res = await api.post("/sync", {
            events,
        });
        console.log(res);
        if (!res.data.error) {
            appDispatch(clearSmarkEvents());
            showSuccess("Synced successfully");
            return;
        }
        showError("Couldn't sync");
    };

    const clearLocal = async () => {
        await setItem("smark_events", []);
        showSuccess("Synced successfully");
        console.log("cleared events");
    };

    const logoutHandler = async () => {
        const res = await api.post("/logout");
        console.log(res.data);

        if (!res.data.error) {
            console.log("logging out ");
            appDispatch(logout());
            showSuccess("Logged out successfully");
            return;
        }
        showError("Couldn't logout");
        console.log("logout failed");
    };

    const fetchHandler = async () => {
        console.log("fetching");
        const res = await api.get("/bookmarks");
        console.log(res);
        if (res.data.bookmarks) {
            appDispatch(setBookmarks(res.data.bookmarks));
            showSuccess("Fetched successfully");
            return;
        }
    };

    return !authState.user ? (
        <div className="py-3 px-4">
            <div
                className="mb-[4.5rem] lg:mb-0 flex items-center justify-center w-full mt-auto
    bg-dark-gray opacity-90 hover:opacity-100 cursor-pointer p-2
    rounded-full font-medium text-base"
                onClick={toggleModal}
            >
                Sign in
            </div>
        </div>
    ) : (
        <div className="py-3 md:py-0 px-4">
            <div
                ref={selfRef}
                className="flex h-[4.5rem] items-center w-full mt-auto px-2
  mb-[4.5rem] lg:mb-0 overflow-hidden"
            >
                <div className="w-fit mr-3" onClick={goToAccount}>
                    <img
                        className="h-10 w-10"
                        src={authState.user.img}
                        alt="profile"
                    />
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold text-sm leading-tight line-clamp-1">
                        {authState.user.name}
                    </h1>
                    <div className="grid grid-rows-1 grid-cols-3 w-full text-sm mt-2 gap-2">
                        {
                            // <div onClick={logoutHandler} className='s-shadow cursor-pointer bg-dark-gray rounded-xl flex justify-center items-center px-2'>
                            //     Logout
                            //     </div>
                        }
                        <Tag
                            title={synced ? "synced" : "sync"}
                            className={`${
                                synced ? "bg-green-600" : "bg-yellow-600"
                            }`}
                            onClick={syncBookmarks}
                        />
                        <Tag title="Fetch" onClick={fetchHandler} />
                        <Tag title="Clear" onClick={clearLocal} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
