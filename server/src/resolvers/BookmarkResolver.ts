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
    async bookmarks(@Arg("listId", () => String!) listId: string): Promise<Bookmark[] | null> {
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

    @Query(() => [Bookmark], { nullable: true })
    async getDefaultList(): Promise<string | null> {
        try {
            const bookmark = await BookmarkModel.find({
                default: true
            }).exec();
            if (!bookmark || bookmark.length > 1) {
                return null
            }
            return "";
        } catch (e) {
            console.log(e)
            return null;
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => BookmarkList, { nullable: true })
    async addBookmarkList(
        @Arg("title", () => String!) title: String,
        @Ctx() ctx: Context
    ): Promise<BookmarkList | null> {
        console.log("context - ", ctx.user);
        try {
            if (!ctx.user?.userId || !title) {
                return null;
            }
            const list = await BookmarkListModel.create({
                userId: ctx.user.userId,
                title: title,
            })
            console.log("List: ", list);
            return list;
        } catch (e) {
            console.log(e)
            return null;
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => BookmarkList, { nullable: true })
    async makeListDefault(
        @Arg("listId", () => String!) listId: String,
        @Ctx() ctx: Context
    ): Promise<boolean> {
        console.log("context - ", ctx.user);
        try {
            if (!ctx.user?.userId || !listId) {
                return false;
            }
            const list = await BookmarkListModel.create({
                userId: ctx.user.userId,
                _id: listId,
            })
            console.log("List: ", list);
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => Boolean, { nullable: true })
    async removeBookmarkList(
        @Arg("listId", () => String!) listId: String,
        @Ctx() ctx: Context
    ): Promise<Boolean> {
        console.log("context - ", ctx.user);
        try {
            if (!ctx.user?.userId || !listId) {
                return false;
            }
            const lists = await BookmarkListModel.findOneAndRemove({
                userId: ctx.user.userId,
                _id: listId,
            })
            if (lists) {
                const urls = await BookmarkModel.remove({
                    listId
                })
                if (urls) {
                    console.log("UrlsDelete: ", urls);
                }
            }
            console.log("ListDelete: ", lists);
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => Boolean, { nullable: true })
    async removeBookmarkLists(
        @Arg("listIds", () => [String!]) listIds: String[],
        @Ctx() ctx: Context
    ): Promise<Boolean> {
        console.log("context - ", ctx.user);
        try {
            if (!ctx.user?.userId || !listIds) {
                return false;
            }
            const lists = await BookmarkListModel.deleteMany({
                "$and": [
                    {
                        userId: ctx.user.userId,
                    },
                    {
                        _id: {
                            "$in": listIds,
                        }
                    }
                ]
            })
            console.log("ListsDelete: ", lists);
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => Boolean, { nullable: true })
    async addBookmark(
        @Arg("bookmark", { nullable: false }) bookmark: BookmarkInput,
        @Ctx() ctx: Context
    ): Promise<Bookmark | null> {
        try {
            if (!ctx.user?.userId || !bookmark.listId) {
                return null;
            }
            const list = await BookmarkListModel.findById(bookmark.listId);
            if (!list) {
                return null;
            }
            const newBookmark = await BookmarkModel.create({
                public: false,
                title: bookmark.title,
                icon: bookmark.title || "",
                url: bookmark.url || "",
                listId: bookmark.listId,
                userId: ctx.user.userId,
            })

            return newBookmark;
        } catch (e) {
            console.log(e)
            return null;
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => Boolean, { nullable: true })
    async addBookmarkToDefaultList(
        @Arg("bookmark", { nullable: false }) bookmark: BookmarkInput,
        @Ctx() ctx: Context
    ): Promise<Bookmark | null> {
        try {
            if (!ctx.user?.userId) {
                return null;
            }
            const list = await BookmarkListModel.findOne({
                default: true
            });
            if (!list) {
                return null;
            }
            const newBookmark = await BookmarkModel.create({
                public: false,
                title: bookmark.title,
                icon: bookmark.title || "",
                url: bookmark.url || "",
                listId: list._id,
                userId: ctx.user.userId,
            })
            return newBookmark;
        } catch (e) {
            console.log(e)
            return null;
        }
    }

    @UseMiddleware(isAuth)
    @Query(() => MeResponse, { nullable: true })
    async me(@Ctx() ctx: Context): Promise<MeResponse | null> {
        console.log("me");
        try {
            const userId = ctx.user?.userId;
            let user = await UserModel.findById(userId).exec();
            if (!user) {
                return null;
            }
            user = user.toObject();
            const allBookmarks = await BookmarkModel.find({
                userId: userId
            }).exec();
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
                default: l.default,
                public: l.public,
                userId: l.userId,
                children: bMap.get(l._id.toString()) || []
            }));

            console.log("ME RESOLVER: ", user, bookmarkLists);

            return {
                user: user!,
                bookmarkLists: bookmarkLists,
            }
        } catch (e) {
            console.log("me error: ", e)
            return null;
        }
    }
}
