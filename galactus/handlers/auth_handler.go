package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/mitchellh/mapstructure"
	"github.com/sudo-nick16/smark/galactus/repository"
	"github.com/sudo-nick16/smark/galactus/types"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func CreateToken(t *types.AuthTokenClaims, key string) (string, error) {
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": t.UserId,
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
		URL, err := url.Parse(google.Endpoint.AuthURL)
		if err != nil {
			return err
		}
		parameters := url.Values{}
		parameters.Add("client_id", config.GoogleConfig.ClientId)
		parameters.Add("scope", strings.Join(config.GoogleConfig.Scopes, " "))
		parameters.Add("redirect_uri", config.GoogleConfig.RedirectUrl)
		parameters.Add("response_type", "code")
		parameters.Add("state", config.OauthStateString)
		URL.RawQuery = parameters.Encode()
		googleOauthUrl := URL.String()

		return c.Redirect(googleOauthUrl, fiber.StatusTemporaryRedirect)
	}
}

func RefreshTokenHandler(config *types.Config, userRepo *repository.UserRepo) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := c.Cookies("smark", "")
		if tokenStr == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "no token provided")
		}
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(config.RefreshKey), nil
		})
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, err.Error())
		}
		claims := token.Claims.(jwt.MapClaims)

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

		uid, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		user, err := userRepo.GetUserById(uid)
		if err != nil {
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

func GoogleCallbackHandler(config *types.Config, googleOauthConf *oauth2.Config, userRepo *repository.UserRepo) fiber.Handler {
	return func(c *fiber.Ctx) error {
		state := c.FormValue("state")

		if state != config.OauthStateString {
			return c.Redirect(config.ClientUrl, fiber.StatusTemporaryRedirect)
		}

		code := c.FormValue("code")
		if code == "" {
			c.JSON(fiber.Map{
				"error": "no code provided",
			})
			return c.Redirect(config.ClientUrl, fiber.StatusTemporaryRedirect)
		}

		token, err := googleOauthConf.Exchange(oauth2.NoContext, code)
		if err != nil {
			return c.Redirect(config.ClientUrl, fiber.StatusTemporaryRedirect)
		}

		resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + url.QueryEscape(token.AccessToken))
		if err != nil {
			return c.Redirect(config.ClientUrl, fiber.StatusTemporaryRedirect)
		}
		defer resp.Body.Close()

		response, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return c.Redirect(config.ClientUrl, fiber.StatusTemporaryRedirect)
		}

		user := types.GoogleUser{}

		json.Unmarshal(response, &user)

		if user.Email == "" {
			return c.Redirect(config.ClientUrl, fiber.StatusTemporaryRedirect)
		}

		usr, _ := userRepo.GetUserByEmail(user.Email)
		if usr == nil {
			usr = &types.User{
				Email:        user.Email,
				Name:         user.Name,
				Img:          user.Picture,
				TokenVersion: 0,
			}
			_, err = userRepo.CreateUser(usr)
		}

		refreshToken, err := CreateToken(&types.AuthTokenClaims{
			UserId:       usr.Id,
			TokenVersion: usr.TokenVersion,
			Exp:          time.Now().Add(time.Hour * 24 * 7).Unix(),
		}, config.RefreshKey)

		if err != nil {
			return err
		}

		cookie := &fiber.Cookie{
			Name:     "smark",
			Value:    refreshToken,
			Secure:   true,
			Expires:  time.Now().Add(time.Hour * 24 * 7),
			HTTPOnly: true,
		}

		if config.IsProduction {
			cookie.SameSite = "None"
		} else {
			cookie.SameSite = "Lax"
		}

		c.Cookie(cookie)

		return c.Redirect(config.ClientUrl)
	}
}

func ChromeAuthHandler(config *types.Config, userRepo *repository.UserRepo) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Query("token", "")
		if token == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "no code provided",
			})
		}

		req, err := http.NewRequest(
			"GET",
			fmt.Sprintf("https://www.googleapis.com/oauth2/v3/userinfo?access_token=%s", token),
			nil)
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
			return errors.New("invalid token")
		}

		var resBody bytes.Buffer
		_, err = resBody.ReadFrom(res.Body)
		if err != nil {
			return err
		}

		var GooglePayload map[string]interface{}
		err = json.Unmarshal(resBody.Bytes(), &GooglePayload)
		if err != nil {
			return err
		}

		var user struct {
			Email string `json:"email"`
			Name  string `json:"name"`
			Img   string `json:"picture"`
		}

		mapstructure.Decode(GooglePayload, &user)

		usr, _ := userRepo.GetUserByEmail(user.Email)
		if usr == nil {
			usr = &types.User{
				Email:        user.Email,
				Name:         user.Name,
				Img:          user.Img,
				TokenVersion: 0,
			}
			_, err = userRepo.CreateUser(usr)
		}

		refreshToken, err := CreateToken(&types.AuthTokenClaims{
			UserId:       usr.Id,
			TokenVersion: usr.TokenVersion,
			Exp:          time.Now().Add(time.Hour * 24 * 7).Unix(),
		}, config.RefreshKey)

		if err != nil {
			return err
		}

		cookie := &fiber.Cookie{
			Name:     "smark",
			Value:    refreshToken,
			Secure:   true,
			Expires:  time.Now().Add(time.Hour * 24 * 7),
			HTTPOnly: true,
		}

		if config.IsProduction {
			cookie.SameSite = "None"
		} else {
			cookie.SameSite = "Lax"
		}

		c.Cookie(cookie)

		return c.JSON(fiber.Map{
			"msg": "user authenticated",
		})
	}
}

func Logout(config *types.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		cookie := &fiber.Cookie{
			Name:     "smark",
			Value:    "",
			SameSite: "None",
			Expires:  time.Now(),
			HTTPOnly: true,
		}
		if config.IsProduction {
			cookie.SameSite = "None"
		} else {
			cookie.SameSite = "Lax"
		}
		c.Cookie(cookie)
		return c.JSON(fiber.Map{
			"msg": "user logged out",
		})
	}
}
