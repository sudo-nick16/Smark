import 'reflect-metadata';
import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@modelOptions({ schemaOptions: { collection: "BookmarkLists" } })
@ObjectType()
export class BookmarkList {
    @prop({ required: true, unique: true, index: true })
    @Field(() => String)
    _id: string;

    @prop({ required: true })
    @Field(() => String)
    title: string

    @prop({ default: false })
    @Field(() => String)
    public: string

    @prop({ default: false })
    @Field(() => Boolean)
    favorite: boolean;

    @prop({ required: true, ref: "User", index: true })
    @Field(() => String)
    userId: string;
}

@modelOptions({ schemaOptions: { collection: "Bookmarks" } })
@index({ userId: 1, listId: 1 }, { unique: true })
@ObjectType()
export class Bookmark {
    @prop({ required: true, unique: true, index: true })
    @Field(() => String)
    _id: string;

    @prop({ required: true, ref: "Users", index: true })
    @Field(() => String)
    userId: string;

    @prop({ required: true, ref: "BookmarkLists", index: true })
    @Field(() => String)
    listId: string;

    @Field(() => String)
    title: string

    @Field(() => String)
    url: string

    @Field(() => String)
    icon: string

    @Field(() => Boolean)
    favorite: boolean;
}


@ObjectType()
export class BookmarkListComplete implements BookmarkList {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    title: string

    @Field(() => String)
    public: string

    @Field(() => Boolean)
    favorite: boolean;

    @Field(() => String)
    userId: string;

    @Field(() => [Bookmark])
    children: Bookmark[]
}

export const BookmarkListModel = getModelForClass(BookmarkList);
export const BookmarkModel = getModelForClass(Bookmark);
