module.exports.gpa_scrape = async function (browser, url) {
  const page = await browser.newPage();
  await page.goto(url);

  await page.type("#username", "");
  await page.type("#password", "");
  await Promise.all([
    page.click(".submit"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]); // enters username and password and submits
  await page.waitForSelector(".bgtabs");
  // try{
  const [el] = await page.$x(
    '//*[@id="section_5"]/tr[1]/td/table/tbody/tr[4]/td[3]'
  );
  const txt = await el.getProperty("textContent");
  const raw = await txt.jsonValue();

  console.log(raw);
  await page.click(".txtsmall2 a");
  await page.waitForSelector(".bgtabs");

  const elements = await page.$x('//*[@id="10"]');
  await elements[0].click();
  await page.waitForSelector(".pagetitle");

  const [el2] = await page.$x(
    '//*[@id="section_5"]/tr[2]/td/table/tbody/tr[4]/td[5]'
  );
  const txt2 = await el2.getProperty("textContent");
  const raw2 = await txt2.jsonValue();

  console.log("Cumulative Career GPA", raw2);
  // }
  // catch (err){
  //  return {error:"unable to access gpa"}
  // }

  return { gpa: raw2 };
};
