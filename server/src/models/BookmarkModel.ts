import { model, Schema } from "mongoose";

const bookmarkListSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    favorite: {
        type: String,
        required: true,
        unique: true
    },
    public: {
        type: Boolean,
        required: true,
        unique: true
    },
}, {
    timestamps: true,
    collection: "users",
});

export const BookmarkListMongo = model("BookmarkList", bookmarkListSchema);
 
const bookmarkSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    favorite: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true,
    collection: "users",
});

export const BookmarkMongo = model("BookmarkList", bookmarkSchema);
