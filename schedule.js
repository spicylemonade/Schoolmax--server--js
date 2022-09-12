module.exports.schedule_scrape = async function (browser, url) {
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(".submit");
  await page.type("#username", "");
  await page.type("#password", "");
  await Promise.all([
    page.click(".submit"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]); // enters username and password and submits
  console.log("work?");

  let checker = await page.$("#id_field_student_name2");

  if (checker == null) {
    await page.waitForSelector(".txtsmall2 a");
    await Promise.all([
      page.click(".txtsmall2 a"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]); // enters username and password and submits
  } // if you had a summer programm and page doesnt auto show up

  await page.waitForXPath('//*[@id="7"]');

  const sch_button = await page.$x('//*[@id="7"]/span');
  await sch_button[0].click();

  await page.click();
};
