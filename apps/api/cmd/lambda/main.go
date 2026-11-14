// The GraphQL API Lambda (provided.al2023), behind an API Gateway HTTP API.
package main

import (
	"os"

	"github.com/Rohin-Chopra/digishelf/apps/api/internal/lambdahttp"
	"github.com/Rohin-Chopra/digishelf/apps/api/internal/server"
	"github.com/Rohin-Chopra/digishelf/apps/api/internal/tmdb"
)

func main() { lambdahttp.Start(server.Handler(tmdb.NewFromEnv(os.Getenv))) }
