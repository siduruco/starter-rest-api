require("fix-esm").register();

const express = require("express");
const app = express();

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREAD_SHEET_ID, serviceAccountAuth);

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
app.post("/:col/:key", async (req, res) => {
  console.log(req.body);
  const col = req.params.col;
  const key = req.params.key;
  res.json(req.body).end();
});

// Delete an item
app.delete("/:col/:key", async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  res.json(req.params).end();
});

// Get a single item
app.get("/:col/:key", async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  await doc.loadInfo();
  const sheet = await doc.addSheet({ headerValues: [`=QUERY(${col},"SELECT * WHERE A = ${key}",1)`] });
  const rows = await sheet.getRows();
  const column = rows[0]?._worksheet?._headerValues;
  const row = [];
  rows.forEach((element) => {
    row.push(element?._rawData);
  });
  await sheet.delete();
  res.json({ column, row }).end();
});

// Get a full listing
app.get("/:col/page/:offset", async (req, res) => {
  const col = req.params.col;
  const offset = parseFloat(req.params.offset) - 1;
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[col];
  const page = [];
  for (let i = 0; i < 100; i++) {
    if (i % 5 === 0) page.push(i);
  }
  const rows = await sheet.getRows({ limit: 5, offset: page[offset] }); // can pass in { limit, offset }
  const column = rows[0]?._worksheet?._headerValues;
  const row = [];
  rows.forEach((element) => {
    row.push(element?._rawData);
  });
  res.json({ column, row }).end();
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
