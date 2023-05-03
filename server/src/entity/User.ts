import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Field, Int, ObjectType } from 'type-graphql';

@modelOptions({ schemaOptions: { collection: "Users" } })
@ObjectType()
export class User {

    @Field(() => String)
    readonly _id: string;

    @prop({required: true })
    @Field(() => String)
    name: string

    @prop({required: false })
    @Field(() => String)
    img: string

    @prop({required: true, unique: true })
    @Field(() => String)
    username: string

    @prop({required: true, unique: true })
    @Field(() => String)
    @Field(() => String)
    email: string;

    @prop({required: true, default: 0})
    @Field(() => Int)
    tokenVersion: number;
}

export const UserModel = getModelForClass(User);
