import { useSelector } from "react-redux";
import sideBar from "../assets/sidebar.png";
import { setBookmarks } from "../store/asyncActions";
import {
    logout,
    RootState,
    setDefaultList,
    toggleSideBar,
    useAppDispatch,
} from "../store/index";
import { setItem } from "../store/storageApi";
import { isChrome } from "../utils/isChrome";
import useAxios from "../utils/useAxios";
import useSnackBarUtils from "../utils/useSnackBar";
import Button from "./Button";

type SettingsProps = {
    className?: string;
};
const Settings: React.FC<SettingsProps> = ({ className = " " }) => {
    const { showError, showSuccess } = useSnackBarUtils();
    const appDispatch = useAppDispatch();
    const api = useAxios();

    const bookmarks = useSelector<RootState, RootState["bookmarks"]>(
        (state) => state.bookmarks
    );
    const defaultList = useSelector<RootState, string>(
        (state) => state.defaultList
    );

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

    const handleDropdownChange = (list: string) => {
        console.log({ list });
        appDispatch(setDefaultList(list));
    };
    return (
        <div className={`flex grow flex-col ${className}`}>
            <div className="w-full h-[4.5rem] px-4 flex items-center justify-start border-b border-dark-gray">
                <img
                    src={sideBar}
                    alt="delete"
                    className="h-8 w-8 mr-3 hover:opacity-90 cursor-pointer lg:hidden"
                    onClick={() => appDispatch(toggleSideBar())}
                />
                <h1 className="font-bold text-xl">Settings</h1>
            </div>
            <div className="w-full h-full p-6">
                <Button onClick={clearLocal}>Clear local events</Button>
                <Button onClick={fetchHandler}>Fetch from remote</Button>

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
                                            bookmark.title === defaultList
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
            </div>
        </div>
    );
};

export default Settings;
