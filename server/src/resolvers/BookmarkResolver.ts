import { TokenPayload } from "api/tokens";
import { isAuth } from "middlewares/isAuth";
import { Arg, Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { Bookmark } from "./entity";
import { BookmarkRepo } from "./repo";

@Resolver()
export class BookmarkResolver {
    constructor(private readonly userRepo: BookmarkRepo) { }

    @Query(() => Promise<Bookmark | undefined>)
    async bookmarks(@Arg("listId") listId: string): Promise<Bookmark | undefined> {
        if (!listId) {
            return undefined;
        }
        return await this.userRepo.findBookmarksByListId(listId);
    }

    @UseMiddleware(isAuth)
    @Query(() => Promise<Bookmark | undefined>)
    async myBookmarks(@Ctx("user") user: TokenPayload): Promise<Bookmark | undefined> {
        return await this.userRepo.find();
    }
}
