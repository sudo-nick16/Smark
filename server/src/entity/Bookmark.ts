import 'reflect-metadata';
import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { ObjectId } from 'mongoose';

@modelOptions({ schemaOptions: { collection: "BookmarkLists" } })
@ObjectType()
export class BookmarkList {
    // @prop({ auto: true, required: true, unique: true, index: true })
    @Field(() => String)
    readonly _id: string;

    @prop({ required: true })
    @Field(() => String)
    title: string

    @prop({ required: false, default: false })
    @Field(() => Boolean)
    default: boolean

    @prop({ default: false })
    @Field(() => Boolean)
    public: boolean

    @prop({ default: false })
    @Field(() => Boolean)
    favorite: boolean;

    @prop({ required: true, ref: "User", index: true })
    @Field(() => String)
    userId: ObjectId;
}

@modelOptions({ schemaOptions: { collection: "Bookmarks" } })
@index({ userId: 1, listId: 1 }, { unique: true })
@ObjectType()
export class Bookmark {
    // @prop({ auto: true, required: true, unique: true, index: true })
    @Field(() => String)
    readonly _id: string;

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

    @Field(() => Boolean)
    public: boolean

    @Field(() => Boolean)
    favorite: boolean;

    @Field(() => Boolean)
    default: boolean;

    @Field(() => String)
    userId: ObjectId;

    @Field(() => [Bookmark])
    children: Bookmark[]
}

export const BookmarkListModel = getModelForClass(BookmarkList);
export const BookmarkModel = getModelForClass(Bookmark);
