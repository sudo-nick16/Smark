import { Bookmark, BookmarkList, BookmarkListComplete, BookmarkModel } from "../entity/Bookmark";

export interface BookmarkRepoImpl {
    findBookmarksByListId(listId: string): Promise<Bookmark[] | null>;
    findBookmarksByListIds(list: BookmarkList[]): Promise<BookmarkListComplete[] | null>;
    findListsByUserId(id: string): Promise<BookmarkList[] | null>;
    findListsByUserId(username: string): Promise<BookmarkList[] | null>;
}

export class BookmarkRepo implements BookmarkRepoImpl {
    async findBookmarksByListId(listId: String): Promise<Bookmark[] | null> {
        const bookmarks = await BookmarkModel.find({ listId: listId }).exec();
        return bookmarks.map(b => b.toObject());
    }

    async findBookmarksByListIds(lists: BookmarkList[]): Promise<BookmarkListComplete[] | null> {
        const listIds = lists.map(list => list._id);
        const bookMarksMap = new Map<string, Bookmark[]>();
        if (listIds.length > 0) {
            const bookmarks = await BookmarkModel.find({ listId: { $in: listIds } }).exec();
            for (let i of bookmarks) {
                let listId = i.listId;
                if (bookMarksMap.has(listId)) {
                    bookMarksMap.get(listId)?.push(i.toObject());
                } else {
                    bookMarksMap.set(listId, [i.toObject()]);
                }
            }
        }
        for (let list of lists) {
            // @ts-ignore
            list["children"] = bookMarksMap.get(list.id) || [];
        }

        return null;
    }

    async findListsByUsername(username: string): Promise<BookmarkList[] | null> {
        console.log(username);
        return null;
    }

    async findListsByUserId(id: string): Promise<BookmarkList[] | null> {
        console.log(id);
        return null;
    }
}
