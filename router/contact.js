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
  res.redirect("/contact/page/0");
});

// Delete an item
router.delete("/:key", async (req, res) => {
  const key = req.params.key;
  res.json(req.params).end();
});

router.get("/", async (req, res) => {
  res.redirect("/contact/page/0");
});

router.get("/add", async (req, res) => {
  res.render("contact_add", {});
});

router.get("/page/:offset", async (req, res) => {
  const edit = parseFloat(req.query?.edit);
  const offset = parseFloat(req.params.offset);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[col];
  const detail = isNaN(edit) ? null : await updateStatus(sheet, edit);
  const page = [];
  for (let i = 0; i < 1000; i++) {
    if (i % 5 === 0) page.push(i);
  }
  const rows = await sheet.getRows({ limit: 5, offset: page[offset] }); // can pass in { limit, offset }
  const column = rows[0]?._worksheet?._headerValues;
  const row = [];
  rows.forEach((element) => {
    row.push({ id: element?._rowNumber, data: element?._rawData, status: element?._rawData.at(-1) });
  });
  if (detail === true) return res.redirect("/contact/page/" + parseFloat(req.params.offset));
  res.render("contact", { column, row, detail, next: offset + 1, prev: offset === 0 ? 0 : offset - 1, page: offset });
});

async function updateStatus(sheet, offset) {
  await sheet.loadCells("A:D"); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
  const status = sheet.getCellByA1(`D${offset}`);
  if (status.value === "TRUE") {
    status.value = "FALSE";
  } else {
    status.value = "TRUE";
  }
  await sheet.saveUpdatedCells(); // save all updates in one call
  return true;
}

module.exports = router;
