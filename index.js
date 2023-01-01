const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const cors = require("cors");
const classes = require("./classes");
const report = require("./gpa");

let browser;
// Use the JSON middleware with a limit of 1 MB and enable CORS
app.use(express.json({ limit: "1mb" }));
app.use(cors());

// Endpoint to get grades
app.get("/get-grades", (req, res) => {
  classes
    .grade_scrape(browser, "https://family.sis.pgcps.org/schoolmax/family.jsp")
    .then((student) => {
      res.json({ student });
    });
});

// Endpoint to get GPA
app.get("/get-gpa", (req, res, next) => {
  report
    .gpa_2(browser, "https://apps.pgcps.org/pls/apex/f?p=259:1001")
    .then((student) => {
      res.json({ student });
    });
});

// Default endpoint
app.get("/", (req, res) => {
  res.send("hello");
});

async function main() {
  const port = process.env.PORT || 5000;
  browser = await puppeteer.launch({
    headless: false,
    //  args: [/*'--no-sandbox',*/ '--disable-setuid-sandbox'
  });
  app.listen(port, () => {
    console.log("server on");
  });
}
main();
