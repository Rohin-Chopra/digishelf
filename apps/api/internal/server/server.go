// Package server is the GraphQL HTTP handler shared by the Lambda and the local dev server.
package server

import (
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/Rohin-Chopra/digishelf/apps/api/graph"
	"github.com/Rohin-Chopra/digishelf/apps/api/internal/tmdb"
)

// Handler serves POST (and GET) /graphql.
func Handler(client *tmdb.Client) http.Handler {
	gql := handler.New(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{TMDB: client},
	}))
	gql.AddTransport(transport.GET{})
	gql.AddTransport(transport.POST{})
	gql.Use(extension.Introspection{})
	gql.Use(extension.FixedComplexityLimit(50))

	mux := http.NewServeMux()
	mux.Handle("/graphql", gql)
	return mux
}
