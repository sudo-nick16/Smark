package repository

import (
	"context"
	"errors"

	"github.com/sudo-nick16/smark/galactus/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BookmarksRepo struct {
	listColl *mongo.Collection
	coll     *mongo.Collection
	Client   *mongo.Client
}

func NewBookmarkRepo(client *mongo.Client) *BookmarksRepo {
	coll := client.Database("smark").Collection("bookmarks")
	listColl := client.Database("smark").Collection("bookmarks_list")
	return &BookmarksRepo{
		coll:     coll,
		listColl: listColl,
		Client:   client,
	}
}

func (b *BookmarksRepo) DeleteBookmark(listTitle, bookmarkTitle string, uid primitive.ObjectID) error {
	bl, err := b.GetBookmarkListByTitle(listTitle, uid)
	if err != nil {
		return err
	}
	_, err = b.coll.DeleteOne(context.TODO(), bson.M{
		"userId": uid,
		"title":  bookmarkTitle,
		"listId": bl.Id,
	})
	if err != nil {
		return err
	}
	return nil
}

func (b *BookmarksRepo) UpdateBookmarkListTitle(newTitle, oldTitle string, uid primitive.ObjectID) error {
	_, err := b.listColl.UpdateOne(context.TODO(), bson.M{
		"userId": uid,
		"title":  oldTitle,
	}, bson.M{
		"$set": bson.M{
			"title": newTitle,
		},
	})
	if err != nil {
		return err
	}
	return nil
}

func (b *BookmarksRepo) UpdateBookmarkUrl(url, title string, uid primitive.ObjectID) error {
	_, err := b.coll.UpdateOne(context.TODO(), bson.M{
		"userId": uid,
		"title":  title,
	}, bson.M{
		"$set": bson.M{
			"url": url,
		},
	})
	if err != nil {
		return err
	}
	return nil
}

func (b *BookmarksRepo) UpdateBookmarkTitle(newTitle, oldTitle string, uid primitive.ObjectID) error {
	_, err := b.coll.UpdateOne(context.TODO(), bson.M{
		"userId": uid,
		"title":  oldTitle,
	}, bson.M{
		"$set": bson.M{
			"title": newTitle,
		},
	})
	if err != nil {
		return err
	}
	return nil
}

func (b *BookmarksRepo) ChangeListVisibility(title string, uid primitive.ObjectID) error {
	_, err := b.listColl.UpdateOne(context.TODO(), bson.M{
		"userId": uid,
		"title":  title,
	}, bson.A{
		bson.M{
			"$set": bson.M{
				"public": bson.M{
					"$not": "$public",
				},
			},
		},
	})
	if err != nil {
		return err
	}
	return nil
}

func (b *BookmarksRepo) CreateBookmarkList(bl *types.BookmarkList) (*types.BookmarkList, error) {
	bl.Public = false
	rs, err := b.listColl.InsertOne(context.TODO(), bl)
	if err != nil {
		return nil, err
	}
	bl.Id = rs.InsertedID.(primitive.ObjectID)
	return bl, nil
}

func (b *BookmarksRepo) DeleteBookmarkList(title string, uid primitive.ObjectID) error {
	_, err := b.listColl.DeleteOne(context.TODO(), bson.M{
		"userId": uid,
		"title":  title,
	})
	if err != nil {
		return err
	}
	return nil
}

func (b *BookmarksRepo) CreateBookmark(bm *types.Bookmark) (*types.Bookmark, error) {
	rs, err := b.coll.InsertOne(context.TODO(), bm)
	if err != nil {
		return nil, err
	}
	bm.Id = rs.InsertedID.(primitive.ObjectID).Hex()
	return bm, nil
}

func (b *BookmarksRepo) GetBookmarks(uid string) (*[]types.BookmarkListWithChildren, error) {
	listCur, err := b.listColl.Find(context.TODO(), bson.M{
		"userId": uid,
	})
	if err != nil {
		return nil, err
	}
	var bookmarks []types.BookmarkListWithChildren
	for listCur.Next(context.Background()) {
		var list types.BookmarkListWithChildren
		err := listCur.Decode(&list)
		if err != nil {
			return nil, err
		}
		bmCur, err := b.coll.Find(context.TODO(), bson.M{
			"listId": list.Id,
			"userId": uid,
		})
		if err != nil {
			return nil, err
		}
		for bmCur.Next(context.Background()) {
			var bm types.Bookmark
			err := bmCur.Decode(&bm)
			if err != nil {
				return nil, err
			}
			list.Bookmarks = append(list.Bookmarks, &bm)
		}
		bookmarks = append(bookmarks, list)
	}
	return &bookmarks, nil
}

func (b *BookmarksRepo) GetBookmarkListById(id string) (*types.BookmarkList, error) {
	res := b.listColl.FindOne(context.TODO(), bson.M{
		"_id": id,
	})
	var lists types.BookmarkList
	err := res.Decode(&lists)
	if err != nil {
		return nil, err
	}
	return &lists, nil
}

func (b *BookmarksRepo) GetBookmarkListByTitle(title string, uid primitive.ObjectID) (*types.BookmarkList, error) {
	res := b.listColl.FindOne(context.TODO(), bson.M{
        "userId": uid,
		"title":  title,
	})
	var lists types.BookmarkList
	err := res.Decode(&lists)
	if err != nil {
		return nil, err
	}
	return &lists, nil
}

func (b *BookmarksRepo) GetBookmarksByListId(lid string) (*[]types.Bookmark, error) {
	id, err := primitive.ObjectIDFromHex(lid)
	if err != nil {
		return nil, errors.New("invalid list id")
	}
	res := b.coll.FindOne(context.TODO(), bson.M{
		"listId": id,
	})
	var bookmarks []types.Bookmark
	err = res.Decode(&bookmarks)
	if err != nil {
		return nil, err
	}
	return &bookmarks, nil
}
