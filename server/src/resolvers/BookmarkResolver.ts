import { isAuth } from "../middlewares/isAuth";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Bookmark, BookmarkList, BookmarkListModel, BookmarkModel } from "../entity/Bookmark";
import { Context } from "../graphql-types/Context";
import { MeResponse } from "../graphql-types/MeResponse";
import { BookmarkInput } from "../graphql-types/InputTypes";
import { UserModel } from "../entity/User";

@Resolver()
export class BookmarkResolver {

    @Query(() => [Bookmark], { nullable: true })
    async bookmarks(@Arg("listId", () => String) listId: string): Promise<Bookmark[] | null> {
        try {
            if (!listId) {
                return null;
            }
            const bookmarks = await BookmarkModel.find({
                listId: listId
            }).exec();
            return bookmarks;

        } catch (e) {
            console.log(e)
            return null;
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => BookmarkList, { nullable: true })
    async addBookmarkList(
        @Arg("title", { nullable: false }) title: String,
        @Ctx() ctx: Context
    ): Promise<BookmarkList | null> {
        try {
            if (!ctx.user?.userId || !title) {
                return null;
            }
            const list = await BookmarkListModel.create({
                userId: ctx.user.userId,
                title: title,
            })
            return list;
        } catch (e) {
            console.log(e)
            return null;
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => Boolean, { nullable: true })
    async addBookmark(
        @Arg("input", { nullable: false }) input: BookmarkInput,
        @Ctx() ctx: Context
    ): Promise<Bookmark | null> {
        try {
            if (!ctx.user?.userId || !input.listId) {
                return null;
            }
            const list = await BookmarkListModel.findById(input.listId);
            if (!list) {
                return null;
            }
            const bookmark = await BookmarkModel.create({
                public: false,
                title: input.title,
                icon: input.title || "",
                url: input.url || "",
                listId: input.listId,
                userId: ctx.user.userId,
            })

            return bookmark;
        } catch (e) {
            console.log(e)
            return null;
        }
    }

    @UseMiddleware(isAuth)
    @Query(() => MeResponse, { nullable: true })
    async me(@Ctx() ctx: Context): Promise<MeResponse | null> {
        try {
            const userId = ctx.user?.userId;
            let user = await UserModel.findById(userId).exec();
            if (user) {
                user = user.toObject();
            }
            const allBookmarks = (await BookmarkModel.find({
                userId: userId
            }).exec())
            const bMap = new Map<string, Bookmark[]>;
            for (let i of allBookmarks) {
                if (bMap.has(i.listId)) {
                    bMap.get(i.listId)!.push(i);
                } else {
                    bMap.set(i.listId, []);
                }
            }
            const bookmarkLists = (await BookmarkListModel.find({
                userId: userId
            }).exec()).map(l => ({
                _id: l._id,
                title: l.title,
                favorite: l.favorite,
                public: l.public,
                userId: l.userId,
                children: bMap.get(l._id)!
            }));

            return {
                user: user!,
                bookmarkLists: bookmarkLists,
                error: ""
            }
        } catch (e) {
            console.log(e)
            return null;
        }
    }
}
