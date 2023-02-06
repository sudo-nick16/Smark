import 'reflect-metadata';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class BookmarkList {
    @Field(()  => String)
    id: string;

    @Field(() => String)
    title: string

    @Field(() => Boolean)
    favorite: boolean;

    @Field(() => String)
    userId: string;
}

@ObjectType()
export class Bookmark {
    @Field(()  => String)
    id: string;

    @Field(()  => String)
    userId: string;

    @Field(() => String)
    title: string

    @Field(() => String)
    url: string

    @Field(() => Boolean)
    favorite: boolean;
}
