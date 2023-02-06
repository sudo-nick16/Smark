import { model, Schema } from "mongoose";

const bookmarkListschema = new Schema({
    title: {
        type: String,
        required: true,
    },
    favorite: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true,
    collection: "users",
});

export const BookmarkListMongo = model("BookmarkList", bookmarkListschema);
