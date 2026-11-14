package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"github.com/Rohin-Chopra/digishelf/apps/api/graph/model"
	"github.com/Rohin-Chopra/digishelf/apps/api/internal/tmdb"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

const MaxQueryLength = 100

type Resolver struct {
	TMDB *tmdb.Client
}

func userError(message, code string) *gqlerror.Error {
	return &gqlerror.Error{Message: message, Extensions: map[string]any{"code": code}}
}

func toModel(t tmdb.Title) *model.Title {
	mediaType := model.MediaTypeMovie
	if t.MediaType == tmdb.TV {
		mediaType = model.MediaTypeTv
	}
	return &model.Title{
		ID:         t.ID,
		MediaType:  mediaType,
		Name:       t.Name,
		Year:       t.Year,
		PosterPath: t.PosterPath,
		Overview:   t.Overview,
	}
}
