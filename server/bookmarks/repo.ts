import { Bookmark, User } from "./entity";

export interface UserRepoImpl {
    findBookmarksByListId(id: string): Promise<User | undefined>;
    findListsByUserId(username: string): Promise<User | undefined>;
    find(email: string): Promise<User | undefined>;
}

export class BookmarkRepo implements UserRepoImpl {
    async findBookmarksByListId(id: string): Promise<Bookmark | undefined> {
        return undefined;
    }

    async findUserByUsername(username: string): Promise<User | undefined> {
        return undefined;
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        return undefined;
    }


}
