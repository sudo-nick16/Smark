import { Bookmark, BookmarkList } from "../entity/Bookmark";

export interface UserRepoImpl {
    findBookmarksByListId(listId: string): Promise<Bookmark[] | undefined>;
    findListsByUserId(username: string): Promise<BookmarkList[] | undefined>;
}

export class BookmarkRepo implements UserRepoImpl {
    async findBookmarksByListId(listId: string): Promise<Bookmark[] | undefined> {
        return undefined;
    }

    async findListsByUserId(username: string): Promise<BookmarkList[] | undefined> {
        return undefined;
    }
}
