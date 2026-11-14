package lambdahttp

import (
	"context"
	"encoding/base64"
	"io"
	"net/http"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestServe(t *testing.T) {
	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(r.Method + " " + r.URL.Path + "?" + r.URL.RawQuery + " " + string(body)))
	})
	res, err := Serve(context.Background(), h, events.APIGatewayV2HTTPRequest{
		RawPath:         "/graphql",
		RawQueryString:  "a=1",
		Headers:         map[string]string{"content-type": "application/json"},
		Body:            base64.StdEncoding.EncodeToString([]byte(`{"query":"{x}"}`)),
		IsBase64Encoded: true,
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			HTTP: events.APIGatewayV2HTTPRequestContextHTTPDescription{Method: "POST"},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if res.StatusCode != 201 || res.Body != `POST /graphql?a=1 {"query":"{x}"}` ||
		res.Headers["Content-Type"] != "application/json" {
		t.Fatalf("%+v", res)
	}
}
