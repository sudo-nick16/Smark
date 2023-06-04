import {
  configureStore,
  createAsyncThunk,
  createListenerMiddleware,
  createSlice,
  isAnyOf,
  PayloadAction,
} from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { BookmarkListWithChildren, User, Event } from "../types";
import {
  clearSmarkEvents,
  createBookmark,
  createList,
  deleteBookmark,
  deleteList,
  setBookmarks,
  setBookmarksFromStorage,
  updateBookmark,
  updateListTitle,
  updateListVisibility,
} from "./asyncActions";
import { getItem, setItem } from "./storageApi";

export const bookmarks = createSlice({
  name: "bookmark",
  initialState: {
    bookmarks: [] as BookmarkListWithChildren[],
    events: [] as Event[],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setBookmarksFromStorage.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.events = action.payload.events;
    });
    builder.addCase(setBookmarks.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
    });
    builder.addCase(clearSmarkEvents.fulfilled, (state) => {
      state.events = [];
    });
    builder.addCase(createList.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.events = action.payload.events;
    });
    builder.addCase(updateListTitle.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.events = action.payload.events;
    });
    builder.addCase(deleteList.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.events = action.payload.events;
    });
    builder.addCase(updateListVisibility.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.events = action.payload.events;
    });
    builder.addCase(createBookmark.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.events = action.payload.events;
    });
    builder.addCase(updateBookmark.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.events = action.payload.events;
    });
    builder.addCase(deleteBookmark.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks;
      state.events = action.payload.events;
    });
  },
});

export const eventCounter = createSlice({
  name: "eventCounter",
  initialState: 0,
  reducers: {},
  extraReducers: (builder) => {},
});

export const currentList = createSlice({
  name: "currentList",
  initialState: "Home",
  reducers: {
    setCurrentList: (_, action: PayloadAction<string>) => {
      return action.payload;
    },
  },
});

export const { setCurrentList } = currentList.actions;

export const setDefaultList = createAsyncThunk(
  "defaultList/setDefaultList",
  async (listTitle: string) => {
    await setItem("defaultList", listTitle);
    return await getItem<string>("defaultList", "Home");
  }
);

export const defaultList = createSlice({
  name: "defaultList",
  initialState: "",
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setDefaultList.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const auth = createSlice({
  name: "auth",
  initialState: {
    accessToken: "",
    user: undefined as User | undefined,
  },
  reducers: {
    setUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.accessToken = "";
      state.user = undefined;
    },
  },
});

export const { setUser, setAccessToken, logout } = auth.actions;

export const syncStatus = createSlice({
  name: "sync_status",
  initialState: {
    status: 0,
  },
  reducers: {
    setSyncStatus: (state, action: PayloadAction<number>) => {
      state.status = action.payload;
    },
  },
});

export const { setSyncStatus } = syncStatus.actions;

export const modalBars = createSlice({
  name: "modalBars",
  initialState: {
    authModal: false,
    sideBar: false,
  },
  reducers: {
    toggleAuthModal: (state) => {
      state.authModal = !state.authModal;
    },
    toggleSideBar: (state) => {
      state.sideBar = !state.sideBar;
    },
    closeAllBarsAndModals: (state) => {
      state.authModal = false;
      state.sideBar = false;
    },
    openSideBar: (state) => {
      state.sideBar = true;
    },
    closeSideBar: (state) => {
      state.sideBar = false;
    },
    openAuthModal: (state) => {
      state.authModal = true;
    },
    closeAuthModal: (state) => {
      state.authModal = false;
    },
  },
});

export const {
  toggleAuthModal,
  toggleSideBar,
  closeSideBar,
  closeAuthModal,
  openAuthModal,
  openSideBar,
  closeAllBarsAndModals,
} = modalBars.actions;

type InputInfo = {
  mode: string;
  currentValue: string;
};

export const inputInfo = createSlice({
  name: "input_info",
  initialState: {
    mode: "",
    currentValue: "",
  },
  reducers: {
    setInputMode: (state, action: PayloadAction<string>) => {
      state.mode = action.payload;
    },
    setInputValue: (state, action: PayloadAction<string>) => {
      state.currentValue = action.payload;
    },
    setInput: (state, action: PayloadAction<InputInfo>) => {
      state.mode = action.payload.mode;
      state.currentValue = action.payload.currentValue;
    },
  },
});

export const { setInputMode, setInputValue, setInput } = inputInfo.actions;

const bookmarkUpdateModal = createSlice({
  name: "bookmark_update_modal",
  initialState: {
    isOpen: false,
    url: "",
    oldTitle: "",
    title: "",
    listTitle: "",
  },
  reducers: {
    openBookmarkModal: (
      state,
      action: PayloadAction<{
        url: string;
        title: string;
        listTitle: string;
      }>
    ) => {
      state.url = action.payload.url;
      state.title = action.payload.title;
      state.oldTitle = action.payload.title;
      state.listTitle = action.payload.listTitle;
      state.isOpen = true
    },
    setBookmarkTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setBookmarkUrl: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
    },
    closeBookmarkModal: (state) => {
      state.isOpen = false;
      state.url = "";
      state.title = "";
      state.oldTitle = "";
      state.listTitle = "";
    },
  },
});

export const {
  openBookmarkModal,
  closeBookmarkModal,
  setBookmarkUrl,
  setBookmarkTitle,
} = bookmarkUpdateModal.actions;

const snackBarSlice = createSlice({
  name: "snackbar",
  initialState: {
    isOpen: false,
    message: "",
    error: false,
  },
  reducers: {
    openSnackBar: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      state.isOpen = true;
    },
    showErrorMessage: (state, action: PayloadAction<string>) => {
      state.error = true;
      state.message = action.payload;
      state.isOpen = true;
    },
    showSuccessMessage: (state, action: PayloadAction<string>) => {
      state.error = false;
      state.message = action.payload;
      state.isOpen = true;
    },
    closeSnackBar: (state) => {
      state.error = false;
      state.message = "";
      state.isOpen = false;
    },
  },
});

export const {
  openSnackBar,
  closeSnackBar,
  showErrorMessage,
  showSuccessMessage,
} = snackBarSlice.actions;

export const smarkEventsListener = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    bookmarks: bookmarks.reducer,
    currentList: currentList.reducer,
    modalBars: modalBars.reducer,
    auth: auth.reducer,
    inputInfo: inputInfo.reducer,
    defaultList: defaultList.reducer,
    bookmarkUpdateModal: bookmarkUpdateModal.reducer,
    syncStatus: syncStatus.reducer,
    snackBar: snackBarSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(smarkEventsListener.middleware),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
