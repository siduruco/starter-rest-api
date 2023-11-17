const express = require("express");
const router = express.Router();

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
  rows.forEach((element, index) => {
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
