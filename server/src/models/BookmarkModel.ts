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
    userId: {
        type: String,
        required: true,
    },
    public: {
        type: Boolean,
        required: true,
        unique: true
    },
}, {
    timestamps: true,
    collection: "bookmarklists",
});

export const BookmarkListModel = model("BookmarkList", bookmarkListSchema);

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
    listId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true,
    collection: "bookmarks",
});

export const BookmarkModel = model("Bookmark", bookmarkSchema);
