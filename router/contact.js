const express = require("express");
const router = express.Router();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
});
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREAD_SHEET_ID, serviceAccountAuth);
const col = "contact";

// Create or Update an item
router.post("/:key", async (req, res) => {
  console.log(req.body);
  const key = req.params.key;
  await doc.loadInfo();
  res.json(req.body).end();
});

// Delete an item
router.delete("/:key", async (req, res) => {
  const key = req.params.key;
  res.json(req.params).end();
});

// Get a single item
router.get("/:key", async (req, res) => {
  const key = req.params.key;
  await doc.loadInfo();
  const sheet = await doc.addSheet({ headerValues: [`=QUERY(${col},"SELECT * WHERE A = ${key}",1)`] });
  const rows = await sheet.getRows();
  const column = rows[0]?._worksheet?._headerValues;
  const row = [];
  rows.forEach((element, index) => {
    row.push(element?._rawData);
  });
  await sheet.delete();
  res.json({ column, row }).end();
});

// Get a full listing
router.get("/page/:offset", async (req, res) => {
  const offset = parseFloat(req.params.offset) - 1;
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[col];
  const page = [];
  for (let i = 0; i < 100; i++) {
    if (i % 4 === 0) page.push(i);
  }
  const rows = await sheet.getRows({ limit: 5, offset: page[offset] }); // can pass in { limit, offset }
  const column = rows[0]?._worksheet?._headerValues;
  const row = [];
  rows.forEach((element, index) => {
    console.log(index + 1 + page[offset]);
    console.log(element?._rawData);
    row.push(element?._rawData);
  });
  res.json({ column, row }).end();
});

module.exports = router;
