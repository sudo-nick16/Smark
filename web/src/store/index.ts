import { configureStore, createAsyncThunk, createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux';
import { BookmarkListWithChildren, User } from '../types';
import { createBookmark, createList, deleteBookmark, deleteList, setBookmarksFromStorage, updateBookmarkTitle, updateBookmarkUrl, updateListTitle, updateListVisibility } from './asyncActions';
import { getItem, setItem } from './storageApi';

export const bookmarks = createSlice({
    name: "bookmark",
    initialState: [] as BookmarkListWithChildren[],
    reducers: {
        // createList: (state, action: { payload: BookmarkListWithChildren }) => {
        //     if (isChrome()) {
        //         const bookmarks = await getAsyncItem<BookmarkListWithChildren[]>("bookmarks")
        //         if (bookmarks) {
        //             setAsyncItem("bookmarks", [...bookmarks, action.payload])
        //         }
        //     }
        //     state.push(action.payload);
        // },
        // deleteList: (state, action: { payload: string }) => {
        //     state.filter((bookmark) => bookmark._id !== action.payload);
        // },
        // updateList: (state, action: { payload: { oldTitle: string; newTitle: string } }) => {
        //     state.map((bookmark) => {
        //         if (bookmark.title === action.payload.oldTitle) {
        //             return {
        //                 ...bookmark,
        //                 title: action.payload.newTitle
        //             };
        //         }
        //         return bookmark;
        //     })
        // },
        // createBookmark: (state, action: PayloadAction<Bookmark>) => {
        //     state.map((bookmark) => {
        //         if (bookmark.title === action.payload.listTitle) {
        //             bookmark.children.push(action.payload)
        //         }
        //         return bookmark;
        //     })
        // },
        // deleteBookmark: (state, action: { payload: Bookmark }) => {
        //     state.map((list) => {
        //         if (list.title === action.payload.listTitle) {
        //             list.children.filter((bookmark) => bookmark.title !== action.payload.title)
        //         }
        //         return list;
        //     })
        // },
        // updateBookmark: (state, action: { payload: Bookmark }) => {
        //     return state.map((list) => {
        //         if (list.title === action.payload.listTitle) {
        //             list.children.map((bookmark) => {
        //                 if (bookmark._id === action.payload._id) {
        //                     return action.payload;
        //                 }
        //                 return bookmark;
        //             })
        //         }
        //         return list;
        //     })
        // },
    },
    extraReducers: (builder) => {
        builder.addCase(setBookmarksFromStorage.fulfilled, (_, action) => {
            return action.payload
        })
        builder.addCase(createList.fulfilled, (_, action) => {
            return action.payload
        })
        builder.addCase(deleteList.fulfilled, (_, action) => {
            return action.payload
        })
        builder.addCase(updateListTitle.fulfilled, (_, action) => {
            return action.payload
        })
        builder.addCase(updateListVisibility.fulfilled, (_, action) => {
            return action.payload
        })
        builder.addCase(createBookmark.fulfilled, (_, action) => {
            return action.payload
        })
        builder.addCase(updateBookmarkTitle.fulfilled, (_, action) => {
            return action.payload
        })
        builder.addCase(updateBookmarkUrl.fulfilled, (_, action) => {
            return action.payload
        })
        builder.addCase(deleteBookmark.fulfilled, (_, action) => {
            return action.payload
        })
    }
})

export const currentList = createSlice({
    name: "currentList",
    initialState: "Home",
    reducers: {
        setCurrentList: (_, action: PayloadAction<string>) => {
            return action.payload
        }
    }
})

export const { setCurrentList } = currentList.actions

export const setDefaulList = createAsyncThunk("defaultList/setDefaultList", async (listTitle: string) => {
    await setItem("defaultList", listTitle);
    return await getItem<string>("defaultList") || "Home";
})

export const defaultList = createSlice({
    name: "defaultList",
    initialState: "",
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setDefaulList.fulfilled, (_, action) => {
            return action.payload
        })
    }
})


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
            state.accessToken = ""
            state.user = undefined
        }
    }
})

export const { setUser, setAccessToken, logout } = auth.actions

export const authModal = createSlice({
    name: "auth_modal",
    initialState: {
        isOpen: false
    },
    reducers: {
        toggleAuthModal: (state) => {
            console.log(current(state));
            state.isOpen = !state.isOpen;
            console.log(current(state));
        }
    }
})

export const { toggleAuthModal } = authModal.actions

type InputInfo = {
    mode: string;
    currentValue: string;
}

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
        }
    }
})

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
        openBookmarkModal: (state, action: PayloadAction<{ url: string; title: string; listTitle: string }>) => {
            state.url = action.payload.url;
            state.title = action.payload.title;
            state.oldTitle = action.payload.title;
            state.listTitle = action.payload.listTitle;
            state.isOpen = !state.isOpen;
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
        }
    }
})

export const { openBookmarkModal, closeBookmarkModal, setBookmarkUrl, setBookmarkTitle } = bookmarkUpdateModal.actions;

export const store = configureStore({
    reducer: {
        bookmarks: bookmarks.reducer,
        currentList: currentList.reducer,
        authModal: authModal.reducer,
        auth: auth.reducer,
        inputInfo: inputInfo.reducer,
        defaultList: defaultList.reducer,
        bookmarkUpdateModal: bookmarkUpdateModal.reducer,
    },
})


export default store;
export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch 
