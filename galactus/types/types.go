package types

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	Id   primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name string             `json:"name,omitempty" bson:"name,omitempty"`
	// UserName     string `json:"username,omitempty" bson:"username,omitempty"`
	Email        string `json:"email,omitempty" bson:"email,omitempty"`
	Img          string `json:"img,omitempty" bson:"img,omitempty"`
	TokenVersion int    `json:"tokenVersion,omitempty" bson:"tokenVersion,omitempty"`
}

type BookmarkList struct {
	Id     primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Title  string             `json:"title,omitempty" bson:"title,omitempty"`
	Public bool               `json:"public" bson:"public"`
	UserId primitive.ObjectID `json:"userId,omitempty" bson:"userId,omitempty"`
}

type BookmarkListWithChildren struct {
	Id        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Title     string             `json:"title,omitempty" bson:"title,omitempty"`
	Public    bool               `json:"public" bson:"public"`
	UserId    primitive.ObjectID `json:"userId,omitempty" bson:"userId,omitempty"`
	Bookmarks []*Bookmark        `json:"bookmarks,omitempty" bson:"bookmarks,omitempty"`
}

type Bookmark struct {
	Id     string             `json:"_id,omitempty" bson:"_id,omitempty"`
	Title  string             `json:"title,omitempty" bson:"title,omitempty"`
	Url    string             `json:"url,omitempty" bson:"url,omitempty"`
	ListId primitive.ObjectID `json:"listId,omitempty" bson:"listId,omitempty"`
	UserId primitive.ObjectID `json:"userId,omitempty" bson:"userId,omitempty"`
}

type AuthTokenClaims struct {
	// Username     string `json:"username,omitempty"`
	UserId       primitive.ObjectID `json:"userId,omitempty"`
	TokenVersion int                `json:"tokenVersion,omitempty"`
	Exp          int64              `json:"exp,omitempty"`
}

type Config struct {
	Port         string
	DbUrl        string
	AccessKey    string
	RefreshKey   string
	GoogleConfig GoogleConfig
}

type GoogleConfig struct {
	ClientId     string
	ClientSecret string
	RedirectUrl  string
}

const (
	CreateListEvent           = "create_list"
	UpdateListTitleEvent      = "update_list_title"
	ChangeListVisibilityEvent = "change_list_visibility"
	DeleteListEvent           = "delete_list"
	CreateBookmarkEvent       = "create_bookmark"
	UpdateBookmarkTitleEvent  = "update_title"
	UpdateBookmarkUrlEvent    = "update_url"
	DeleteBookmarkEvent       = "delete_bookmark"
)

type EventData interface {
	Bookmark | BookmarkList
}

type Event struct {
	Type string                 `json:"type,omitempty"`
	Data map[string]interface{} `json:"data,omitempty"`
}

type SyncEventRequest struct {
	Events []Event `json:"events,omitempty"`
}

type CreateListEventData BookmarkList

type UpdateListEventData BookmarkList

type DeleteListEventData struct {
	Id string
}

type CreateBookmarkEventData struct {
	Bookmark *Bookmark
}
