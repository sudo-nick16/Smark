export type Bookmark = {
    _id?: string;
    title: string;
    img: string;
    url: string;
    listTitle: string;
    userId: string;
};

export type BookmarkList = {
    _id?: string;
    title: string;
    public: boolean;
    userId: string;
};

export type BookmarkListWithChildren = {
    _id?: string;
    title: string;
    public: boolean;
    userId: string;
    children: Bookmark[];
};

export type User = {
    _id?: string;
    name: string;
    email: string;
    img: string;
    tokenVersion: number;
};

export const CreateListEvent = "create_list";
export const UpdateListEvent = "update_list";
export const DeleteListEvent = "delete_list";
export const CreateBookmarkEvent = "create_bookmark";
export const UpdateBookmarkEvent = "update_bookmark";
export const DeleteBookmarkEvent = "delete_bookmark";
export const UpdateListVisibilityEvent = "update_list_visibility";

export type CreateListEventData = {
    title: string;
};

export type UpdateListEventData = {
    newTitle: string;
    oldTitle: string;
};

export type DeleteListEventData = {
    title: string;
};

export type CreateBookmarkEventData = {
    listTitle: string;
    title: string;
    url: string;
    img: string;
};

export type UpdateBookmarkEventData = {
    listTitle: string;
    oldTitle: string;
    newTitle: string;
    url: string;
};

export type DeleteBookmarkEventData = {
    listTitle: string;
    title: string;
};

export type UpdateListVisibilityEventData = {
    title: string;
};

export type Event =
    | {
          type: typeof CreateListEvent;
          data: CreateListEventData;
      }
    | {
          type: typeof UpdateListEvent;
          data: UpdateListEventData;
      }
    | {
          type: typeof DeleteListEvent;
          data: DeleteListEventData;
      }
    | {
          type: typeof CreateBookmarkEvent;
          data: CreateBookmarkEventData;
      }
    | {
          type: typeof UpdateBookmarkEvent;
          data: UpdateBookmarkEventData;
      }
    | {
          type: typeof DeleteBookmarkEvent;
          data: DeleteBookmarkEventData;
      }
    | {
          type: typeof UpdateListVisibilityEvent;
          data: UpdateListVisibilityEventData;
      };

export type Bookmarks = BookmarkList[];
