package main

import (
	"github.com/sudo-nick16/smark/server/oauth"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/sudo-nick16/smark/server/graph"
)

const defaultPort = "42069"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	schema := graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}})

	srv := handler.NewDefaultServer(schema)

	http.HandleFunc("/auth/google/login", oauth.OauthGoogleLogin)
	http.HandleFunc("/auth/google/callback", oauth.OauthGoogleCallback)

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", srv)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
