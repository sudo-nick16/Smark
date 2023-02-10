import { Field, InputType } from "type-graphql";

@InputType()
export class BookmarkListInput {
    @Field(() => String)
    title: string
}

@InputType()
export class BookmarkInput {
    @Field(() => String)
    title: string

    @Field(() => String)
    url: string

    @Field(() => String)
    icon: string

    @Field(() => String)
    listId: string
}
