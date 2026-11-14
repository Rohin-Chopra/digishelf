package tmdb

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

func serve(t *testing.T, h http.HandlerFunc) *Client {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	return &Client{BaseURL: srv.URL + "/3/", APIKey: "v3-key", HTTP: srv.Client()}
}

func TestSearchMapsMoviesAndTVAndDropsPeople(t *testing.T) {
	c := serve(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/3/search/multi" || r.URL.Query().Get("query") != "matrix" ||
			r.URL.Query().Get("api_key") != "v3-key" || r.URL.Query().Get("include_adult") != "false" {
			t.Errorf("unexpected request %s", r.URL)
		}
		w.Write([]byte(`{"results":[
			{"id":603,"media_type":"movie","title":"The Matrix","release_date":"1999-03-31","poster_path":"/m.jpg","overview":"o"},
			{"id":1,"media_type":"person","name":"Keanu Reeves"},
			{"id":603,"media_type":"tv","name":"Matrix","first_air_date":"","poster_path":null},
			{"id":9,"media_type":"movie","title":""}
		]}`))
	})
	got, err := c.Search(context.Background(), "matrix")
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 {
		t.Fatalf("got %d titles, want 2: %+v", len(got), got)
	}
	if m := got[0]; m.MediaType != Movie || m.Name != "The Matrix" || *m.Year != 1999 || *m.PosterPath != "/m.jpg" {
		t.Errorf("movie = %+v", m)
	}
	if tv := got[1]; tv.MediaType != TV || tv.ID != 603 || tv.Year != nil || tv.PosterPath != nil {
		t.Errorf("tv = %+v", tv)
	}
}

func TestSearchSendsV4TokensAsBearer(t *testing.T) {
	c := serve(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer eyJtoken" || r.URL.Query().Has("api_key") {
			t.Errorf("auth: header %q, query %s", r.Header.Get("Authorization"), r.URL.RawQuery)
		}
		w.Write([]byte(`{"results":[]}`))
	})
	c.APIKey = "eyJtoken"
	if got, err := c.Search(context.Background(), "x"); err != nil || len(got) != 0 {
		t.Fatalf("got %v, %v", got, err)
	}
}

func TestSearchErrors(t *testing.T) {
	for name, h := range map[string]http.HandlerFunc{
		"status":     func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(500) },
		"bad json":   func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("<html>")) },
		"no results": func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte(`{}`)) },
	} {
		t.Run(name, func(t *testing.T) {
			if _, err := serve(t, h).Search(context.Background(), "x"); err == nil {
				t.Fatal("want error")
			}
		})
	}
	t.Run("network", func(t *testing.T) {
		c := serve(t, func(http.ResponseWriter, *http.Request) {})
		c.BaseURL = "http://127.0.0.1:1"
		if _, err := c.Search(context.Background(), "x"); err == nil {
			t.Fatal("want error")
		}
	})
	t.Run("no key", func(t *testing.T) {
		c := NewFromEnv(func(string) string { return "" })
		if _, err := c.Search(context.Background(), "x"); !errors.Is(err, ErrNotConfigured) {
			t.Fatalf("err = %v", err)
		}
	})
}
