package main

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/sudo-nick16/smark/galactus/handlers"
	"github.com/sudo-nick16/smark/galactus/middlewares"
	"github.com/sudo-nick16/smark/galactus/repository"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
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
		log.Panic("Couldn't connect to mongodb.")
	}

	googleOauthConf := &oauth2.Config{
		ClientID:     config.GoogleConfig.ClientId,
		ClientSecret: config.GoogleConfig.ClientSecret,
		RedirectURL:  config.GoogleConfig.RedirectUrl,
		Scopes:       config.GoogleConfig.Scopes,
		Endpoint:     google.Endpoint,
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

	corsMiddleware := cors.New(cors.Config{
		AllowOrigins:     config.Origin,
		AllowCredentials: true,
	})

	app.Use(corsMiddleware)

	app.Static("", "index.html")

	app.Post("/refresh-token", handlers.RefreshTokenHandler(config, userRepo))

	app.Post("/sync", middlewares.AuthMiddleware(config), handlers.SyncBookmarks(userRepo, bookmarkRepo))

	app.Get("/bookmarks", middlewares.AuthMiddleware(config), handlers.GetBookmarks(bookmarkRepo))

	app.Get("/bookmarks/share/:title", middlewares.AuthMiddleware(config), handlers.GetShareLink(bookmarkRepo, config))

	app.Get("/bookmarks/:userId/:bookmarkListId", handlers.GetPublicList(bookmarkRepo))

	app.Get("/me", middlewares.AuthMiddleware(config), handlers.GetMe(userRepo))

	app.Get("/oauth/google", handlers.GoogleAuthflowHandler(config))

	app.Get("/oauth/chrome", handlers.ChromeAuthHandler(config, userRepo))

	app.Get("/oauth/google/callback", handlers.GoogleCallbackHandler(config, googleOauthConf, userRepo, bookmarkRepo), corsMiddleware)

	app.Post("/logout", middlewares.AuthMiddleware(config), handlers.Logout(config))

	app.Listen(":" + config.Port)
}
