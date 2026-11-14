package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Rohin-Chopra/digishelf/apps/api/internal/tmdb"
)

type gqlResponse struct {
	Data   *struct{ Search []map[string]any } `json:"data"`
	Errors []struct {
		Message    string         `json:"message"`
		Extensions map[string]any `json:"extensions"`
	} `json:"errors"`
}

func query(t *testing.T, h http.Handler, q string) gqlResponse {
	t.Helper()
	body, _ := json.Marshal(map[string]any{
		"query":     `query($q: String!) { search(query: $q) { id mediaType name year posterPath } }`,
		"variables": map[string]string{"q": q},
	})
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/graphql", strings.NewReader(string(body)))
	req.Header.Set("Content-Type", "application/json")
	h.ServeHTTP(rec, req)
	var res gqlResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("%d %s", rec.Code, rec.Body)
	}
	return res
}

func tmdbServer(t *testing.T, status int, body string) *tmdb.Client {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(status)
		w.Write([]byte(body))
	}))
	t.Cleanup(srv.Close)
	return &tmdb.Client{BaseURL: srv.URL, APIKey: "k", HTTP: srv.Client()}
}

func TestSearch(t *testing.T) {
	h := Handler(tmdbServer(t, 200, `{"results":[{"id":1396,"media_type":"tv","name":"Breaking Bad","first_air_date":"2008-01-20"}]}`))
	res := query(t, h, "  breaking ")
	if len(res.Errors) > 0 || len(res.Data.Search) != 1 {
		t.Fatalf("%+v", res)
	}
	got := res.Data.Search[0]
	if got["mediaType"] != "TV" || got["name"] != "Breaking Bad" || got["year"] != float64(2008) || got["posterPath"] != nil {
		t.Errorf("%+v", got)
	}
}

func TestSearchErrorCodes(t *testing.T) {
	for _, tc := range []struct {
		name, q, code string
		client        *tmdb.Client
	}{
		{"too long", strings.Repeat("a", 101), "BAD_USER_INPUT", tmdbServer(t, 200, `{"results":[]}`)},
		{"upstream", "matrix", "UNAVAILABLE", tmdbServer(t, 500, "")},
		{"no key", "matrix", "NOT_CONFIGURED", &tmdb.Client{}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			res := query(t, Handler(tc.client), tc.q)
			if len(res.Errors) != 1 || res.Errors[0].Extensions["code"] != tc.code {
				t.Fatalf("%+v", res.Errors)
			}
		})
	}
}

func TestEmptyQueryDoesNotCallTMDB(t *testing.T) {
	res := query(t, Handler(&tmdb.Client{}), "   ")
	if len(res.Errors) > 0 || len(res.Data.Search) != 0 {
		t.Fatalf("%+v", res)
	}
}
