require("fix-esm").register();

const express = require("express");

const app = express();

const hbs = require("hbs");

const path = require("path");

app.set("view engine", "hbs");

app.set("views", path.join(__dirname, "views"));

// Register a custom helper function
hbs.registerHelper("isTrue", function (value) {
  switch (value) {
    case "TRUE":
      return true;
    case "FALSE":
      return false;
    default:
      return "";
  }
});

hbs.registerHelper("ifStatus", function (value) {
  if (value !== "TRUE" && value !== "FALSE") return value;
});

hbs.registerHelper("plus", function (value) {
  return parseFloat(value) + 1;
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html", "css", "js", "ico", "jpg", "jpeg", "png", "svg"],
  index: ["index.html"],
  maxAge: "1m",
  redirect: false,
};

app.use(express.static("public", options));

const routeContact = require("./router/contact");

app.use("/contact", routeContact);

app.use("*", (req, res) => {
  res.render("index", {});
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`index.js listening on ${port}`);
});
