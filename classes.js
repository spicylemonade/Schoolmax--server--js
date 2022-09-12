async function get_classes(page) {
  //let gradebook = await page.$x("//a[contains(text(), 'Gradebook')]");
  let gradebook = await page.evaluateHandle(
    (text) =>
      [...document.querySelectorAll("a")].find((a) => a.innerText === text),
    "Gradebook"
  );
  console.log(gradebook.length);
  await gradebook.click(); //clicks on gradebook link
  await page.waitForSelector(".pagetitle");

  let classes = await page.$$eval(
    "#section_5 .arrowizer tbody tr",
    (anchors) => {
      return anchors.map((anchor) => anchor.textContent);
    }
  );
  // gets your classes in a list format
  for (let i = 0; i < classes.length; i++) {
    classes[i] = classes[i].replace(/(\r\n|\n|\r|\t|)/gm, "");
    classes[i] = classes[i].replace("[Grades] [Assignments]", "");
  }
  //cleans unnecessary elements
  classes = classes.filter(function (x) {
    return x !== "";
  });
  //removes extra blank elements
  classes.shift(); //removes title

  let grade_links = await page.$x("//a[contains(text(), 'Grades')]"); //gets each link with grade in it
  let grades = [];
  //let gradearr = []; //creats an array for grades
  for (let i = 0; i < grade_links.length; i++) {
    //loops over each link
    try {
      await grade_links[i].click(); //clicks on grade link
      await page.waitForSelector("td.content1");
      let [grade_object] = await page.$x(
        '//*[@id="section_5"]/tr[2]/td/table/tbody/tr[2]/td[5]'
      );
      let class_grade = await (
        await grade_object.getProperty("textContent")
      ).jsonValue();

      //classes[i] += class_grade; // adds grades to corresponding classes

      grades.push(class_grade);

      //gradearr.push(faw)
    } catch (error) {
      grades.push("");
    }
    await page.goBack();
    await page.waitForSelector("td.content1");
    grade_links = await page.$x("//a[contains(text(), 'Grades')]");
  }
  console.log(classes, grades);

  //await page.close();

  return { classes: classes, grades: grades };
}

module.exports.grade_scrape = async function (browser, url) {
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

  await page.waitForXPath('//*[@id="9"]');

  const student_name = await page.$eval(
    "#id_field_student_name2",
    (element) => element.innerHTML
  ); // get your name
  console.log(student_name);

  classes = await get_classes(page);

  await page.close();

  return { name: student_name, class_grades: classes };
};
