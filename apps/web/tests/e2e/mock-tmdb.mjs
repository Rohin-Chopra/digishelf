// Minimal stand-in for the TMDB API so e2e tests don't need a real key.
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_TMDB_PORT ?? 4010);

const FIXTURES = [
  {
    id: 603,
    media_type: "movie",
    title: "The Matrix",
    release_date: "1999-03-31",
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    overview: "A hacker learns the truth about reality.",
  },
  {
    id: 604,
    media_type: "movie",
    title: "The Matrix Reloaded",
    release_date: "2003-05-15",
    poster_path: "/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg",
    overview: "Neo and the rebels fight on.",
  },
  {
    id: 6384,
    media_type: "person",
    name: "Keanu Reeves",
  },
  {
    id: 1396,
    media_type: "tv",
    name: "Breaking Bad",
    first_air_date: "2008-01-20",
    poster_path: null, // exercises the no-poster fallback
    overview: "A chemistry teacher turns to crime.",
  },
];

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (url.pathname === "/health") {
    res.writeHead(200).end("ok");
    return;
  }

  if (url.pathname !== "/3/search/multi") {
    res.writeHead(404).end();
    return;
  }

  const query = (url.searchParams.get("query") ?? "").toLowerCase();
  if (query === "explode") {
    res.writeHead(500).end();
    return;
  }

  const results = FIXTURES.filter((item) =>
    (item.title ?? item.name).toLowerCase().includes(query),
  );
  res
    .writeHead(200, { "content-type": "application/json" })
    .end(JSON.stringify({ page: 1, results }));
}).listen(PORT, () => {
  console.log(`mock TMDB listening on ${PORT}`);
});
