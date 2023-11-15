require("fix-esm").register();
const express = require("express");
const app = express();

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREAD_SHEET_ID, serviceAccountAuth);

(async () => {
  await doc.loadInfo(); // loads document properties and worksheets
  console.log(doc.title);
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
const options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html", "css", "js", "ico", "jpg", "jpeg", "png", "svg"],
  index: ["index.html"],
  maxAge: "1m",
  redirect: false,
};
// app.use(express.static("public", options));
// #############################################################################

// Create or Update an item
app.post("/:factory/:col/:key", async (req, res) => {
  console.log(req.body);
  const col = req.params.col;
  const key = req.params.key;
  res.json(req.body).end();
});

// Delete an item
app.delete("/:factory/:col/:key", async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  res.json(req.params).end();
});

// Get a single item
app.get("/:factory/:col/:key", async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  res.json(req.params).end();
});

// Get a full listing
app.get("/:factory/:col", async (req, res) => {
  const col = req.params.col;
  res.json(req.params).end();
});

// Catch all handler for all other request.
app.use("*", (req, res) => {
  res.json({ msg: "no route handler found" }).end();
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`index.js listening on ${port}`);
});
