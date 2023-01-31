export type Bookmark = {
    title: string;
    selected: boolean;
    favorite: boolean;
    icon?: string; 
    url: string;
    children: Bookmark[]
};

export type Bookmarks = Bookmark[];
