// Package tmdb searches The Movie Database. The API key stays on the server.
package tmdb

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const DefaultBaseURL = "https://api.themoviedb.org/3"

var ErrNotConfigured = errors.New("TMDB_API_KEY is not set")

type MediaType string

const (
	Movie MediaType = "movie"
	TV    MediaType = "tv"
)

type Title struct {
	ID         int
	MediaType  MediaType
	Name       string
	Year       *int
	PosterPath *string
	Overview   string
}

type Client struct {
	BaseURL string
	// A v4 read access token (a JWT, sent as a bearer token) or a v3 API key.
	APIKey string
	HTTP   *http.Client
}

func NewFromEnv(getenv func(string) string) *Client {
	base := getenv("TMDB_API_BASE_URL")
	if base == "" {
		base = DefaultBaseURL
	}
	return &Client{
		BaseURL: base,
		APIKey:  strings.TrimSpace(getenv("TMDB_API_KEY")),
		HTTP:    &http.Client{Timeout: 8 * time.Second},
	}
}

type multiResult struct {
	ID           int     `json:"id"`
	MediaType    string  `json:"media_type"`
	Title        string  `json:"title"`
	Name         string  `json:"name"`
	ReleaseDate  string  `json:"release_date"`
	FirstAirDate string  `json:"first_air_date"`
	PosterPath   *string `json:"poster_path"`
	Overview     string  `json:"overview"`
}

func (c *Client) Search(ctx context.Context, query string) ([]Title, error) {
	if c.APIKey == "" {
		return nil, ErrNotConfigured
	}
	u, err := url.Parse(strings.TrimSuffix(c.BaseURL, "/") + "/search/multi")
	if err != nil {
		return nil, err
	}
	q := url.Values{
		"query":         {query},
		"include_adult": {"false"},
		"language":      {"en-US"},
		"page":          {"1"},
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	if strings.HasPrefix(c.APIKey, "eyJ") {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
	} else {
		q.Set("api_key", c.APIKey)
	}
	u.RawQuery = q.Encode()
	req.URL = u

	res, err := c.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("tmdb: %w", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tmdb: status %d", res.StatusCode)
	}
	var body struct {
		Results *[]multiResult `json:"results"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return nil, fmt.Errorf("tmdb: decoding response: %w", err)
	}
	if body.Results == nil {
		return nil, errors.New("tmdb: response has no results")
	}
	titles := []Title{}
	for _, r := range *body.Results {
		if t, ok := toTitle(r); ok {
			titles = append(titles, t)
		}
	}
	return titles, nil
}

func toTitle(r multiResult) (Title, bool) {
	var name, date string
	switch MediaType(r.MediaType) {
	case Movie:
		name, date = r.Title, r.ReleaseDate
	case TV:
		name, date = r.Name, r.FirstAirDate
	default:
		return Title{}, false
	}
	if name == "" {
		return Title{}, false
	}
	t := Title{ID: r.ID, MediaType: MediaType(r.MediaType), Name: name, Overview: r.Overview}
	if len(date) >= 4 {
		if y, err := strconv.Atoi(date[:4]); err == nil {
			t.Year = &y
		}
	}
	if r.PosterPath != nil && *r.PosterPath != "" {
		t.PosterPath = r.PosterPath
	}
	return t, true
}
