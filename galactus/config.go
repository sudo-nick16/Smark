package main

import (
	"log"

	dotenv "github.com/joho/godotenv"
	"github.com/sudo-nick16/env"
	"github.com/sudo-nick16/smark/galactus/types"
)

func setupConfig() *types.Config {
	err := dotenv.Load(".env")
	if err != nil {
		log.Println("Error loading .env file")
	}
	return &types.Config{
		Port:       env.GetEnv("PORT", "42069"),
		DbUrl:      env.GetEnv("DB_URL", "mongodb://root:shorty1@127.0.0.1:27017/?serverSelectionTimeoutMS=2000"),
		Origin:     env.GetEnv("ORIGIN", "localhost, http://localhost:5173, chrome-extension://fmolcfaicblfnadllocamjmheeaabhif"),
		AccessKey:  env.GetEnv("ACCESS_KEY", "neioneio"),
		RefreshKey: env.GetEnv("REFRESH_KEY", "arstarst"),
		ClientUrl:  env.GetEnv("CLIENT_URL", "http://localhost:5173"),
		ServerUrl:  env.GetEnv("SERVER_URL", "http://localhost:42069"),
		GoogleConfig: types.GoogleConfig{
			ClientId:     env.GetEnv("GOOGLE_CLIENT_ID", ""),
			ClientSecret: env.GetEnv("GOOGLE_CLIENT_SECRET", ""),
			RedirectUrl:  env.GetEnv("GOOGLE_REDIRECT_URI", ""),
			Scopes: env.GetEnvAsSlice("GOOGLE_SCOPS", []string{
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			}, ","),
		},
		OauthStateString: env.GetEnv("OAUTH_STATE_STRING", "23fspstg67ljmgtp56jmgs567"),
        IsProduction: env.GetEnvAsBool("IS_PRODUCTION", false),
	}
}
