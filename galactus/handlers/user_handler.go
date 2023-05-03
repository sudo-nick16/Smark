package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sudo-nick16/smark/galactus/repository"
	"github.com/sudo-nick16/smark/galactus/types"
)

func GetMe(userRepo *repository.UserRepo) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authCtx := c.Locals("AuthContext").(*types.AuthTokenClaims)
		if authCtx == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		user, err := userRepo.GetUserById(authCtx.UserId)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "user no longer exits")
		}
		return c.JSON(fiber.Map{
			"user": user,
		})
	}
}
