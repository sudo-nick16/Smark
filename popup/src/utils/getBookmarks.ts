import { BookmarkListWithChildren, getItem } from "@smark/common";

const getBookmarks = async (): Promise<BookmarkListWithChildren[]> =>
    await getItem<BookmarkListWithChildren[]>("bookmarks", [
        {
            title: "Home",
            public: false,
            userId: "",
            children: [],
        },
    ]);

export default getBookmarks;
