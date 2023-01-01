module.exports.gpa_scrape = async function (browser, url) {
  const page = await browser.newPage();
  await page.goto(url);

  // Enter username and password and submit
  await page.type("#username", "");
  await page.type("#password", "");
  await Promise.all([
    page.click(".submit"),
    page.waitForNavigation({ waitUntil: "networkidl2" }),
  ]);

  // Wait for the element with the class "bgtabs" to appear
  await page.waitForSelector(".bgtabs");

  // Try to get the GPA from the page
  try {
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

    return { gpa: raw2 };
  } catch (err) {
    return { error: "unable to access gpa" };
  }
};

// Helper function that gets the report cards
async function get_report(page) {
  //const labels = await page.$$("#R510796592497650045_jqm_list_view");

  const button = await page.$(
    '[aria-controls="a_Collapsible2_R510911697218021375_content"]'
  );
  await button.click();
  // Get the list element with the id "R510796592497650045_jqm_list_view"
  const listElement = await page.$("#R510911697218021375_jqm_list_view");

  // Get all of the list items within the list element
  const listItems = await listElement.$$("li");

  const grades = {};
  // Initialize the current quarter
  let currentQuarter = null;

  // Loop through each list item
  for (const listItem of listItems) {
    // Check if the list item has the attribute "data-role" with the value "list-divider"
    const isListDivider = await listItem.evaluate(
      (element) => element.getAttribute("data-role") === "list-divider"
    );
    if (isListDivider) {
      // Get the text of the list item (which is the quarter name)
      currentQuarter = await listItem.evaluate(
        (element) => element.textContent
      );
      // Initialize the grades object for the current quarter
      grades[currentQuarter] = {};
    } else {
      // Check if the p element with the class "first-of-type" exists
      const courseNameElement = await listItem.$("p:first-of-type");
      if (courseNameElement && currentQuarter) {
        // Get the text of the first p element within the list item
        const courseName = await courseNameElement.evaluate(
          (element) => element.textContent
        );

        // Get the text of the span element with the class "ui-li-count" within the list item
        const grade = await listItem.$eval(
          ".ui-li-count",
          (element) => element.textContent
        );

        // Add the course name and grade to the grades object for the current quarter
        grades[currentQuarter][courseName] = grade;
      }
    }
  }
  console.log(grades);
  return grades;
}

module.exports.gpa_2 = async function (browser, url) {
  const page = await browser.newPage();
  await page.goto(url);

  // Enter username and password and submit
  await page.type("#P1001_USERNAME", "");
  await page.type("#P1001_PASSWORD", "");
  console.log("here");

  page.click("#P1001_LOGIN");
  await page.waitForNavigation();
  // Click on the 4th element in the list with ID "resize_jqm_list_view"

  const element = await page.$x('//*[@id="resize_jqm_list_view"]/li[4]');

  // Click on the element
  await element[0].click();
  // Wait for the page to load after the click
  await page.waitForNavigation();
  let tracker = await get_report(page);

  await page.close();
  return tracker;
};
