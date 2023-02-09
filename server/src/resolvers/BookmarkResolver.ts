import { isAuth } from "../middlewares/isAuth";
import { Arg, Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { Bookmark } from "../entity/Bookmark";
import { BookmarkRepo } from "../repository/BookmarkRepo";
import { Context } from "../graphql-types/Context";
import { UserRepo } from "../repository/UserRepo";
import { MeResponse } from "../graphql-types/MeResponse";

@Resolver()
export class BookmarkResolver {
    constructor(private readonly userRepo: UserRepo, private readonly bookmarkRepo: BookmarkRepo) { }

    @Query(() => [Bookmark], { nullable: true })
    async bookmarks(@Arg("listId", () => String) listId: string): Promise<Bookmark[] | null> {
        try {
            if (!listId) {
                return null;
            }
            const bookmarks = await this.bookmarkRepo.findBookmarksByListId(listId);
            return bookmarks;

        } catch (e) {
            console.log(e)
            return null;

        }
    }

    @UseMiddleware(isAuth)
    @Query(() => MeResponse, { nullable: true })
    async myBookmarks(@Ctx() ctx: Context): Promise<MeResponse | null> {
        try {
            const userId = ctx.user?.userId;
            const user = await this.userRepo.findUserById(userId!);
            const bookmarkLists = await this.bookmarkRepo.findListsByUserId(userId!);
            const bookmarks = await this.bookmarkRepo.findBookmarksByListIds(bookmarkLists!);
            return {
                user: user!,
                bookmarkLists: bookmarks!,
                error: ""
            }
        } catch (e) {
            console.log(e)
            return null;
        }
    }
}
