package middlewares

import (
	"errors"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sudo-nick16/smark/galactus/types"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuthMiddleware(config *types.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenFromHeader := c.GetReqHeaders()["Authorization"]
		log.Printf("Token from header: %v\n", tokenFromHeader)
		if tokenFromHeader == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "access token missing.")
		}
		accessToken := strings.Split(tokenFromHeader, " ")[1]
		log.Printf("access token: %v\n", accessToken)

		token, err := jwt.Parse(accessToken, func(t *jwt.Token) (interface{}, error) {
			if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, errors.New("invalid token")
			}
			return []byte(config.AccessKey), nil
		})
		if err != nil {
            log.Printf("Error parsing token: %v\n", err)
			return fiber.NewError(fiber.StatusUnauthorized, "token is invalid")
		}
		tokenClaims := token.Claims.(jwt.MapClaims)
		if tokenClaims["userId"] == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		if tokenClaims["exp"] == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		if tokenClaims["tokenVersion"] == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		uid, err := primitive.ObjectIDFromHex(tokenClaims["userId"].(string))
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		authContext := &types.AuthTokenClaims{
			UserId:       uid,
			TokenVersion: int(tokenClaims["tokenVersion"].(float64)),
			Exp:          int64(tokenClaims["exp"].(float64)),
		}
		c.Locals("AuthContext", authContext)
		return c.Next()
	}
}
