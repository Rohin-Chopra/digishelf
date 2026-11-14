import { expect, test, type Page } from "@playwright/test";

// Typing before React hydrates would be lost, so wait for the root route's marker.
async function visit(page: Page, url: string) {
  await page.goto(url);
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
}

async function reload(page: Page) {
  await page.reload();
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
}

const POSTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="342" height="513"><rect width="100%" height="100%" fill="#6b4f3a"/></svg>`;

test.beforeEach(async ({ page }) => {
  await page.route("https://image.tmdb.org/**", (route) =>
    route.fulfill({ contentType: "image/svg+xml", body: POSTER_SVG }),
  );
});

test("search, add to shelf, view and remove", async ({ page }) => {
  await visit(page, "/");
  await expect(page.getByText("Your shelf is empty.")).toBeVisible();

  await page.getByRole("link", { name: "Find something to add" }).click();
  await expect(page).toHaveURL(/\/search$/);

  await page.getByLabel("Search movies and TV shows").fill("matrix");
  await expect(page).toHaveURL(/\/search\?q=matrix$/);

  const results = page.getByRole("list", { name: "Search results" });
  await expect(results.getByRole("listitem")).toHaveCount(2);
  await expect(results.getByText("Movie · 1999")).toBeVisible();
  await expect(
    results.getByRole("img", { name: "The Matrix poster" }),
  ).toHaveAttribute(
    "src",
    /^https:\/\/image\.tmdb\.org\/t\/p\/w\d+\/f89U3ADr1oiB1s9GkdPOEpXUk5H\.jpg$/,
  );

  await page.getByRole("button", { name: "Add The Matrix to shelf" }).click();
  await expect(
    page.getByRole("button", { name: "Remove The Matrix from shelf" }),
  ).toHaveText("On your shelf ✓");

  await page.getByLabel("Search movies and TV shows").fill("breaking");
  await expect(results.getByRole("listitem")).toHaveCount(1);
  await page.getByRole("button", { name: "Add Breaking Bad to shelf" }).click();

  await page.getByRole("link", { name: "My shelf" }).click();
  const shelf = page.getByRole("list", { name: "My shelf" });
  await expect(shelf.getByRole("listitem")).toHaveCount(2);
  await expect(page.getByText("2 titles")).toBeVisible();
  // Newest first; Breaking Bad has no poster so its name is shown instead.
  await expect(shelf.getByRole("listitem").first()).toContainText("TV · 2008");

  await reload(page);
  await expect(shelf.getByRole("listitem")).toHaveCount(2);

  await page
    .getByRole("button", { name: "Remove Breaking Bad from shelf" })
    .click();
  await expect(shelf.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText("1 title", { exact: true })).toBeVisible();

  await page
    .getByRole("button", { name: "Remove The Matrix from shelf" })
    .click();
  await expect(page.getByText("Your shelf is empty.")).toBeVisible();
});

test("search reflects shelf state and survives a reload via the URL", async ({
  page,
}) => {
  await visit(page, "/search?q=matrix");
  await expect(page.getByLabel("Search movies and TV shows")).toHaveValue(
    "matrix",
  );
  await page
    .getByRole("button", { name: "Add The Matrix Reloaded to shelf" })
    .click();

  await reload(page);
  await expect(
    page.getByRole("button", { name: "Remove The Matrix Reloaded from shelf" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add The Matrix to shelf" }),
  ).toBeVisible();
});

test("navigating to search clears the previous query", async ({ page }) => {
  await visit(page, "/search");
  await page.getByLabel("Search movies and TV shows").fill("matrix");
  await expect(page).toHaveURL(/\/search\?q=matrix$/);
  await expect(
    page.getByRole("button", { name: "Add The Matrix to shelf" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Add titles" }).click();
  await expect(page).toHaveURL(/\/search$/);
  await expect(page.getByLabel("Search movies and TV shows")).toHaveValue("");
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/\/search$/);
});

test("shows empty and error states", async ({ page }) => {
  await visit(page, "/search?q=zzzz");
  await expect(page.getByText("No results for “zzzz”.")).toBeVisible();

  await visit(page, "/search?q=explode");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Search is unavailable right now",
  );
});

test("shows TMDB attribution", async ({ page }) => {
  await visit(page, "/");
  await expect(
    page.getByText(
      "This product uses the TMDB API but is not endorsed or certified by TMDB.",
    ),
  ).toBeVisible();
});
