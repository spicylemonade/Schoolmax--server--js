const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const cors = require("cors");
const classes = require("./classes");
const report = require("./gpa");

async function main() {
  const port = process.env.PORT || 5000;
  const browser = await puppeteer.launch({
    headless: false,
    //  args: [/*'--no-sandbox',*/ '--disable-setuid-sandbox'],
  });

  process.on("uncaughtException", function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
  });
  // app.use(express.json({ limit: '1mb' }));
  // app.use(cors());

  app.get("/main", (req, res) => {
    classes
      .grade_scrape(
        browser,
        "https://family.sis.pgcps.org/schoolmax/family.jsp"
      )
      .then((student) => {
        res.json({ student });
      });
  });

  app.get("/gpa", (req, res, next) => {
    report
      .gpa_scrape(browser, "https://family.sis.pgcps.org/schoolmax/family.jsp")
      .then((student) => {
        res.json({ student });
      });
  });
  app.get("/", (req, res) => {
    res.send("hello");
  });

  app.listen(port, () => {
    console.log("server on");
  });
}
main();
