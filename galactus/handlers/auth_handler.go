package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sudo-nick16/smark/galactus/repository"
	"github.com/sudo-nick16/smark/galactus/types"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateToken(t *types.AuthTokenClaims, key string) (string, error) {
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": t.UserId,
		// "username":     t.Username,
		"tokenVersion": t.TokenVersion,
		"exp":          t.Exp,
	})
	signedToken, err := jwtToken.SignedString([]byte(key))
	if err != nil {
		return "", err
	}
	return signedToken, nil
}

func GetGoogleOauthUrl(gc *types.GoogleConfig) string {
	googleOauthUrl := "https://accounts.google.com/o/oauth2/v2/auth?"
	scopes := []string{
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
	}
	values := url.Values{}
	values.Add("access_type", "offline")
	values.Add("scope", strings.Join(scopes, " "))
	values.Add("response_type", "code")
	values.Add("client_id", gc.ClientId)
	values.Add("redirect_uri", gc.RedirectUrl)
	googleOauthUrl += values.Encode()
	return googleOauthUrl
}

func GoogleAuthflowHandler(config *types.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		googleOauthUrl := GetGoogleOauthUrl(&config.GoogleConfig)
		log.Printf("Google auth url: %v", googleOauthUrl)
		err := c.Redirect(googleOauthUrl)
		if err != nil {
			return err
		}
		return nil
	}
}

func RefreshTokenHandler(config *types.Config, userRepo *repository.UserRepo) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := c.Cookies("smark", "")
		log.Printf("token-string: %v\n", tokenStr)
		if tokenStr == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "no token provided")
		}
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			log.Printf("received token: %v\n", token)
			if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(config.RefreshKey), nil
		})
		log.Printf("parsed token: %v\n", token)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, err.Error())
		}
		claims := token.Claims.(jwt.MapClaims)
		log.Printf("claims: %v\n", claims)

		if claims["userId"] == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		if claims["tokenVersion"] == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		if claims["exp"] == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		id := claims["userId"].(string)

		log.Printf("UserId: %v\n", id)

		uid, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		user, err := userRepo.GetUserById(uid)
		if err != nil {
			log.Printf("error: %v\n", err)
			return fiber.NewError(fiber.StatusUnauthorized, "user not found")
		}
		if user.TokenVersion > int(claims["tokenVersion"].(float64)) {
			return fiber.NewError(fiber.StatusUnauthorized, "account was reset")
		}
		accessToken, err := CreateToken(&types.AuthTokenClaims{
			UserId:       user.Id,
			TokenVersion: user.TokenVersion,
			Exp:          time.Now().Add(time.Hour * 1).Unix(),
		}, config.AccessKey)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "couldn't create token")
		}
		c.JSON(fiber.Map{
			"accessToken": accessToken,
			"msg":         "token refreshed",
		})
		return nil
	}
}

func GoogleCallbackHandler(config *types.Config, userRepo *repository.UserRepo) fiber.Handler {
	return func(c *fiber.Ctx) error {
		code := c.Query("code", "")
		if code == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "no code provided",
			})
		}
		log.Printf("code: %v\n", code)

		values := url.Values{}
		values.Add("grant_type", "authorization_code")
		values.Add("code", code)
		values.Add("client_id", config.GoogleConfig.ClientId)
		values.Add("client_secret", config.GoogleConfig.ClientSecret)
		values.Add("redirect_uri", config.GoogleConfig.RedirectUrl)

		req, err := http.NewRequest(
			"POST",
			"https://oauth2.googleapis.com/token",
			strings.NewReader(values.Encode()))
		if err != nil {
			return err
		}

		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		client := http.Client{
			Timeout: time.Second * 30,
		}

		res, err := client.Do(req)
		if err != nil {
			return err
		}

		if res.StatusCode != http.StatusOK {
			return errors.New("could not retrieve token")
		}

		var resBody bytes.Buffer
		_, err = resBody.ReadFrom(res.Body)
		if err != nil {
			return err
		}

		var GoogleAuthTokenRes map[string]interface{}
		err = json.Unmarshal(resBody.Bytes(), &GoogleAuthTokenRes)
		if err != nil {
			return err
		}

		idToken := GoogleAuthTokenRes["id_token"].(string)

		// fmt.Printf("Google Auth Res: %v", GoogleAuthTokenRes)

		t, _, err := jwt.NewParser().ParseUnverified(idToken, jwt.MapClaims{})
		if err != nil {
			log.Println("error: ", err)
			return err
		}
		userEmail := t.Claims.(jwt.MapClaims)["email"].(string)
		usr, _ := userRepo.GetUserByEmail(userEmail)
		if usr == nil {
			usr = &types.User{
				Email:        userEmail,
				Name:         t.Claims.(jwt.MapClaims)["name"].(string),
				Img:          t.Claims.(jwt.MapClaims)["picture"].(string),
				TokenVersion: 0,
			}
			_, err = userRepo.CreateUser(usr)
		}
		token, err := CreateToken(&types.AuthTokenClaims{
			UserId: usr.Id,
			// Username:     usr.UserName,
			TokenVersion: usr.TokenVersion,
			Exp:          time.Now().Add(time.Hour * 24 * 7).Unix(),
		}, config.RefreshKey)

		if err != nil {
			log.Println("error while creating refresh token: ", err)
			return err
		}

		c.Cookie(&fiber.Cookie{
			Name:     "smark",
			Value:    token,
			Secure:   true,
			Expires:  time.Now().Add(time.Hour * 24 * 7),
			HTTPOnly: true,
		})
		// fmt.Printf("Token struct from google: %v\nClaims: %v", t, t.Claims)
		c.Redirect("/")
		return nil
	}
}
