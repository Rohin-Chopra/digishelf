// Package lambdahttp runs a net/http handler behind API Gateway HTTP APIs (payload v2),
// so the same handler serves Lambda and the local dev server.
package lambdahttp

import (
	"context"
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func Start(h http.Handler) {
	lambda.Start(func(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
		return Serve(ctx, h, req)
	})
}

func Serve(ctx context.Context, h http.Handler, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	body := req.Body
	if req.IsBase64Encoded {
		b, err := base64.StdEncoding.DecodeString(body)
		if err != nil {
			return events.APIGatewayV2HTTPResponse{StatusCode: http.StatusBadRequest}, nil
		}
		body = string(b)
	}

	u := url.URL{Path: req.RawPath, RawQuery: req.RawQueryString}
	r, err := http.NewRequestWithContext(ctx, req.RequestContext.HTTP.Method, u.String(), strings.NewReader(body))
	if err != nil {
		return events.APIGatewayV2HTTPResponse{StatusCode: http.StatusBadRequest}, nil
	}
	for k, v := range req.Headers {
		r.Header.Set(k, v)
	}

	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, r)

	headers := map[string]string{}
	for k, v := range rec.Header() {
		headers[k] = strings.Join(v, ", ")
	}
	return events.APIGatewayV2HTTPResponse{
		StatusCode: rec.Code,
		Headers:    headers,
		Body:       rec.Body.String(),
	}, nil
}
