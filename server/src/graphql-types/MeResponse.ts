import "reflect-metadata";
import { Field, ObjectType } from "type-graphql";
import { BookmarkListComplete } from "../entity/Bookmark";
import { User } from "../entity/User";

@ObjectType()
export class MeResponse {
    @Field(() => User)
    user: User;

    @Field(() => [BookmarkListComplete])
    bookmarkLists: BookmarkListComplete[];
}
