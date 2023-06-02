import { getItem } from "../store/storageApi";
import { BookmarkListWithChildren, Event } from "../types";

export const processEvents = async (bookmarks: BookmarkListWithChildren[]) => {
  const pendingEvents = await getItem<Event[]>("smark_events", []);
  for (let event of pendingEvents) {
    switch (event.type) {
      case "create_bookmark": {
        const data = event.data;
        bookmarks.forEach((l) => {
          if (l.title.trim() === data.listTitle.trim()) {
            if (
              !l.children.find(
                (b) =>
                  b.title.trim() === data.title.trim() ||
                  b.url.trim() === data.url.trim()
              )
            ) {
              l.children.push({
                title: data.title,
                url: data.url,
                img: data.img,
                listTitle: data.listTitle,
                userId: "",
              });
            }
          }
        });
        break;
      }
      case "update_bookmark": {
        const data = event.data;
        bookmarks.forEach((list) => {
          if (list.title.trim() === data.listTitle.trim()) {
            list.children.forEach((bookmark) => {
              if (bookmark.title.trim() === data.oldTitle.trim()) {
                bookmark.title = data.newTitle.trim();
                bookmark.url = data.url.trim();
              }
            });
          }
        });
        break;
      }
      case "delete_bookmark": {
        const data = event.data;
        bookmarks.forEach((list) => {
          if (list.title.trim() === data.listTitle.trim()) {
            list.children = list.children.filter(
              (b) => b.title.trim() !== data.title.trim()
            );
          }
        });
        break;
      }
      case "create_list": {
        const data = event.data;
        if (bookmarks.find((l) => l.title.trim() === data.title.trim())) {
          break;
        }
        bookmarks.push({
          title: data.title,
          children: [],
          public: false,
          userId: "",
        });
        break;
      }
      case "update_list": {
        const data = event.data;
        bookmarks.forEach((list) => {
          if (list.title.trim() === data.oldTitle.trim()) {
            list.title = data.newTitle;
          }
        });
        break;
      }
      case "delete_list": {
        const data = event.data;
        bookmarks = bookmarks.filter(
          (list) => list.title.trim() !== data.title.trim()
        );
        break;
      }
      case "update_list_visibility": {
        const data = event.data;
        bookmarks.forEach((list) => {
          if (list.title.trim() === data.title.trim()) {
            list.public = !list.public;
          }
        });
        break;
      }
      default: {
        console.log("unknown event type");
      }
    }
  }
  return bookmarks;
};
