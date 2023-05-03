export type Bookmark = {
    id: string;
    title: string;
    selected?: boolean;
    favorite?: boolean;
    icon?: string;
    url: string;
    children: Bookmark[]
};

export type BookmarkList = {
    id: string;
    title: string;
    favorite: boolean;
    selected: boolean;
    children: Bookmark[];
}

export type Bookmarks = BookmarkList[];
