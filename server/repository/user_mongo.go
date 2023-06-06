package repository

import (
	"context"

	"github.com/sudo-nick16/smark/galactus/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepo struct {
	coll   *mongo.Collection
	Client *mongo.Client
}

func NewUserRepo(client *mongo.Client) *UserRepo {
	coll := client.Database("smark").Collection("users")
	return &UserRepo{
		coll:   coll,
		Client: client,
	}
}

func (u *UserRepo) CreateUser(usr *types.User) (*types.User, error) {
	res, err := u.coll.InsertOne(context.TODO(), bson.M{
		"name": usr.Name,
		// "username":     usr.UserName,
		"email":        usr.Email,
		"img":          usr.Img,
		"tokenVersion": usr.TokenVersion,
	})
	if err != nil {
		return nil, err
	}
	usr.Id = res.InsertedID.(primitive.ObjectID)
	return usr, nil
}

func (u *UserRepo) GetUserById(uid primitive.ObjectID) (*types.User, error) {
	res := u.coll.FindOne(context.TODO(), bson.M{
		"_id": uid,
	})
	var user types.User
	err := res.Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserRepo) GetUserByEmail(email string) (*types.User, error) {
	res := u.coll.FindOne(context.TODO(), bson.M{
		"email": email,
	})
	if res.Err() != nil {
		return nil, res.Err()
	}
	var user types.User
	err := res.Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
