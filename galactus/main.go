package main

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sudo-nick16/smark/galactus/handlers"
	"github.com/sudo-nick16/smark/galactus/middlewares"
	"github.com/sudo-nick16/smark/galactus/repository"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func syncHandler(c *fiber.Ctx) error {
	return nil
}

func main() {
	config := setupConfig()

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(config.DbUrl))
	if err != nil {
		log.Panic("couldn't connect to mongodb.")
	}

	userRepo := repository.NewUserRepo(client)
	bookmarkRepo := repository.NewBookmarkRepo(client)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}
			err = ctx.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
			return nil
		},
	})

	app.Static("", "index.html")

	app.Post("/refresh-token", handlers.RefreshTokenHandler(config, userRepo))

	app.Post("/sync", middlewares.AuthMiddleware(config), handlers.SyncBookmarks(userRepo, bookmarkRepo))

	app.Get("/me", middlewares.AuthMiddleware(config), handlers.GetMe(userRepo))

	app.Get("/oauth/google", handlers.GoogleAuthflowHandler(config))

	app.Get("/oauth/google/callback", handlers.GoogleCallbackHandler(config, userRepo))

	app.Listen(config.Port)
}
