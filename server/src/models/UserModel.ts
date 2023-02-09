import { model, Schema } from "mongoose";
import { ObjectType } from "type-graphql";

@ObjectType()
@Schema()
export class User {
    @Field(() =>)
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    tokenVersion: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
    collection: "users",
};

export const UserModel = model("User", schema);
