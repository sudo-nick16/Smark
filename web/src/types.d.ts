export type Bookmark = {
    _id?: string;
    title: string;
    img: string;
    url: string;
    listTitle: string
    userId: string;
};

export type BookmarkList = {
    _id?: string;
    title: string;
    public: boolean;
    userId: string;
}

export type BookmarkListWithChildren = {
    _id?: string;
    title: string;
    public: boolean;
    userId: string;
    children: Bookmark[];
}

export type User = {
    _id?: string;
    name: string;
    email: string;
    img: string;
    tokenVersion: int;
}

export type Event = {
    type: string;
    data: any;
}

export type Bookmarks = BookmarkList[];
