package handlers

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
	"github.com/sudo-nick16/smark/galactus/repository"
	"github.com/sudo-nick16/smark/galactus/types"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func SyncBookmarks(userRepo *repository.UserRepo, bookmarksRepo *repository.BookmarksRepo) fiber.Handler {
	failedSyncError := fiber.NewError(fiber.StatusBadRequest, "failed to sync")

	return func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		authCtx := c.Locals("AuthContext").(*types.AuthTokenClaims)
		if authCtx == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		userId := authCtx.UserId
		requestBody := types.SyncEventRequest{}
		err := c.BodyParser(&requestBody)
		if err != nil {
			return err
		}

		events := requestBody.Events

		callback := func(sessCtx mongo.SessionContext) (interface{}, error) {
			for _, v := range events {
				switch v.Type {
				case types.CreateListEvent:
					{
						bl := types.BookmarkList{}
						bl.UserId = userId
						bl.Public = false
						err := mapstructure.Decode(v.Data, &bl)
						if err != nil {
							return nil, failedSyncError
						}
						list, _ := bookmarksRepo.GetBookmarkListByTitle(bl.Title, userId)
						if list == nil {
							_, err = bookmarksRepo.CreateBookmarkList(&bl)
							if err != nil {
								return nil, failedSyncError
							}
						}
						// continue if list already exists
						break
					}
				case types.UpdateListTitleEvent:
					{
						data := struct {
							OldTitle string `json:"oldTitle"`
							NewTitle string `json:"newTitle"`
						}{}
						mapstructure.Decode(v.Data, &data)
						err := bookmarksRepo.UpdateBookmarkListTitle(data.NewTitle, data.OldTitle, userId)
						if err != nil {
							return nil, failedSyncError
						}
						break
					}
				case types.ChangeListVisibilityEvent:
					{
						data := types.BookmarkList{}
						mapstructure.Decode(v.Data, &data)
						if strings.ToLower(strings.TrimSpace(data.Title)) == "home" {
							continue
						}
						err := bookmarksRepo.ChangeListVisibility(data.Title, userId)
						if err != nil {
							return nil, err
						}
						break
					}
				case types.DeleteListEvent:
					{
						data := types.BookmarkList{}
						mapstructure.Decode(v.Data, &data)
						err := bookmarksRepo.DeleteBookmarkList(data.Title, userId)
						if err != nil {
							return nil, err
						}
						break
					}
				case types.CreateBookmarkEvent:
					{
						data := types.Bookmark{}
						data.UserId = userId
						mapstructure.Decode(v.Data, &data)
						lst, err := bookmarksRepo.GetBookmarkListByTitle(data.ListTitle, userId)
						if err != nil {
							return nil, err
						}
						data.ListId = lst.Id
                        bm, err := bookmarksRepo.GetBookmarkByUrl(data.Url, data.ListTitle, userId)
                        if bm != nil {
                            break;
                        }
						_, err = bookmarksRepo.CreateBookmark(&data)
						if err != nil {
							return nil, err
						}
						break
					}
				case types.UpdateBookmarkTitleEvent:
					{
						data := struct {
							OldTitle string `json:"oldTitle"`
							Title    string `json:"title"`
						}{}
						mapstructure.Decode(v.Data, &data)
						err := bookmarksRepo.UpdateBookmarkTitle(data.Title, data.OldTitle, userId)
						if err != nil {
							return nil, err
						}
						break
					}
				case types.UpdateBookmarkEvent:
					{
						data := struct {
							OldTitle  string `json:"oldTitle"`
							NewTitle  string `json:"newTitle"`
							ListTitle string `json:"listTitle"`
							Url       string `json:"url"`
						}{}
						mapstructure.Decode(v.Data, &data)
						err := bookmarksRepo.UpdateBookmark(data.Url, data.NewTitle, data.OldTitle, userId, data.ListTitle)
						if err != nil {
							return nil, err
						}
						break
					}
				case types.UpdateBookmarkUrlEvent:
					{
						data := struct {
							Url   string `json:"url"`
							Title string `json:"title"`
						}{}
						mapstructure.Decode(v.Data, &data)
						err := bookmarksRepo.UpdateBookmarkUrl(data.Url, data.Title, userId)
						if err != nil {
							return nil, err
						}
						break
					}
				case types.DeleteBookmarkEvent:
					{
						data := struct {
							Title     string
							ListTitle string
							UserId    string
						}{}
						mapstructure.Decode(v.Data, &data)
						err := bookmarksRepo.DeleteBookmark(data.ListTitle, data.Title, userId)
						if err != nil {
							return nil, err
						}
						break
					}
				}
			}
			return nil, nil
		}

		session, err := bookmarksRepo.Client.StartSession()
		if err != nil {
			return err
		}

		defer session.EndSession(ctx)

		_, err = session.WithTransaction(ctx, callback)
		if err != nil {
			return failedSyncError
		}

		return c.JSON(fiber.Map{
			"message": "synced successfully",
		})
	}
}

func GetBookmarks(bookmarksRepo *repository.BookmarksRepo) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authCtx := c.Locals("AuthContext").(*types.AuthTokenClaims)
		if authCtx == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		userId := authCtx.UserId
		bookmarks, err := bookmarksRepo.GetBookmarks(userId)
		if err != nil {
			return fiber.NewError(fiber.StatusOK, "no bookmarks found")
		}
		return c.JSON(
			fiber.Map{
				"bookmarks": bookmarks,
			},
		)
	}
}

func GetPublicList(bookmarksRepo *repository.BookmarksRepo) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userId := c.Params("userId")
		bookmarkListId := c.Params("bookmarkListId")
		if userId == "" || bookmarkListId == "" {
			return fiber.NewError(fiber.StatusBadRequest, "invalid ids.")
		}
		uid, err := primitive.ObjectIDFromHex(userId)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid user id.")
		}
		id, err := primitive.ObjectIDFromHex(bookmarkListId)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid bookmark list id.")
		}
		bookmarkList, err := bookmarksRepo.GetBookmarkListById(id, uid)
		if err != nil {
			return fiber.NewError(fiber.StatusOK, "list not found.")
		}
		if !bookmarkList.Public {
			return fiber.NewError(fiber.StatusOK, "the list is private.")
		}
		listWithChildren := types.BookmarkListWithChildren{
			Id:     bookmarkList.Id,
			Title:  bookmarkList.Title,
			Public: bookmarkList.Public,
			UserId: bookmarkList.UserId,
		}
		listWithChildren.Children, err = bookmarksRepo.GetBookmarksByListId(bookmarkList.Id, bookmarkList.UserId)
		if err != nil {
			listWithChildren.Children = &[]types.Bookmark{}
		}
		return c.JSON(
			fiber.Map{
				"bookmarkList": listWithChildren,
			},
		)
	}
}

func GetShareLink(bookmarksRepo *repository.BookmarksRepo, config *types.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authCtx := c.Locals("AuthContext").(*types.AuthTokenClaims)
		if authCtx == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		userId := authCtx.UserId
		title := c.Params("title")
		title, err := url.PathUnescape(title)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid title")
		}
		if title == "" {
			return fiber.NewError(fiber.StatusBadRequest, "invalid title")
		}
		bookmarkList, err := bookmarksRepo.GetBookmarkListByTitle(title, userId)
		if err != nil {
			return fiber.NewError(fiber.StatusOK, "no bookmarks found")
		}
		if !bookmarkList.Public {
			return fiber.NewError(fiber.StatusOK, "the list is not public")
		}
		link := fmt.Sprintf("%s/#/%s/%s", config.ClientUrl, userId.Hex(), bookmarkList.Id.Hex())
		return c.JSON(
			fiber.Map{
				"shareLink": link,
			},
		)
	}
}
