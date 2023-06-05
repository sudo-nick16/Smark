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
import settingsIcon from "../assets/settings-gear-icon.png";
import useSnackBarUtils from "../utils/useSnackBar";
import { processEvents } from "../utils/processEvents";

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
      className={`s-shadow px-4 cursor-pointer bg-dark-gray font-bold rounded-xl flex justify-center items-center w-fit ${className}`}
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


  const fetchHandler = async () => {
    console.log("fetching");
    const res = await api.get("/bookmarks");
    console.log(res);
    if (res.data.bookmarks) {
      const bm = await processEvents(res.data.bookmarks);
      appDispatch(setBookmarks(bm));
      showSuccess("Fetched successfully");
      return;
    }
  };

  return !authState.user ? (
    <div className="py-3 px-4 mb-[4.5rem] lg:mb-0 flex items-center">
      <div
        className="flex items-center justify-center 
                w-full mt-auto bg-dark-gray opacity-90 hover:opacity-100
                cursor-pointer p-2 rounded-full font-medium text-base"
        onClick={toggleModal}
      >
        Sign in
      </div>
      <img
        onClick={() => {
          navigate("/more-options");
          appDispatch(toggleSideBar());
        }}
        src={settingsIcon}
        alt="settings"
        className="w-5 h-5 ml-3 hover:opacity-90 cursor-pointer"
      />
    </div>
  ) : (
    <div className="py-3 md:py-0 px-4 w-full">
      <div
        ref={selfRef}
        className="flex h-[4.5rem] items-center w-full mt-auto px-2
                mb-[4.5rem] lg:mb-0 overflow-hidden"
      >
        <div className="w-fit mr-3" onClick={goToAccount}>
          <img className="h-10 w-10" src={authState.user.img} alt="profile" />
        </div>
        <div className="grow flex flex-col px-3">
          <h1 className="font-bold text-base leading-tight line-clamp-1 mb-2">
            {authState.user.name}
          </h1>
          <div className="flex gap-x-3">
            <Tag
              title={synced ? "synced" : "sync"}
              className={`${synced ? "bg-green-600" : "bg-yellow-600"}`}
              onClick={syncBookmarks}
            />
            <Tag
              title="fetch"
              className=""
              onClick={fetchHandler}
            />
          </div>
        </div>
        <img
          onClick={() => {
            navigate("/more-options");
            appDispatch(toggleSideBar());
          }}
          src={settingsIcon}
          alt="settings"
          className="w-5 h-5 ml-3 hover:opacity-90 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Profile;
