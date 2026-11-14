// Local dev server: the Lambda's handler over plain HTTP on ADDR (default :8787).
// ALLOWED_ORIGIN enables CORS for a web build that calls the API cross-origin (the e2e suite).
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Rohin-Chopra/digishelf/apps/api/internal/server"
	"github.com/Rohin-Chopra/digishelf/apps/api/internal/tmdb"
)

func main() {
	addr := os.Getenv("ADDR")
	if addr == "" {
		addr = ":8787"
	}
	h := server.Handler(tmdb.NewFromEnv(os.Getenv))
	if origin := os.Getenv("ALLOWED_ORIGIN"); origin != "" {
		h = cors(origin, h)
	}
	log.Printf("GraphQL API on http://localhost%s/graphql", addr)
	log.Fatal(http.ListenAndServe(addr, h))
}

func cors(origin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Headers", "content-type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
