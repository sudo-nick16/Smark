import { model, Schema } from "mongoose";

const schema = new Schema({
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
        unique: true
    },
}, {
    timestamps: true,
    collection: "users",
});

export const UserMongo = model("User", schema);

