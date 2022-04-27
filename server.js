(async () => {
  const express = require('express');
  const app = express();
  const puppeteer = require('puppeteer');
  const cors = require('cors');
  const port = process.env.PORT || 5000;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log('Node NOT Exiting...');
  });
  app.use(express.json({ limit: '1mb' }));
  app.use(cors());

  app.post('/api', (req, res) => {
    let x = req.body;
    console.log(x.payload.name);
    _scrape('https://family.sis.pgcps.org/schoolmax/family.jsp', x).then((gpa) => {
      res.json({ gpa });
    });
  });
  app.get('/', (req, res) => {
    res.send('hello');
  });
  async function _scrape(url, x) {
    const page = await browser.newPage();
    await page.goto(url);
    
    await page.waitForSelector('.submit');
    await page.type('#username', x.payload.name);
    await page.type('#password', x.payload.pass);
    await Promise.all([
      page.click('.submit'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]); // enters username and password and submits
    console.log('work?');

    let checker = await page.$('#id_field_student_name2');
    
    if (checker == null) {
      await page.waitForSelector('.txtsmall2 a');
      await Promise.all([
        page.click('.txtsmall2 a'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ]); // enters username and password and submits
 
    } // if you had a summer programm and page doesnt auto show up

    await page.waitForXPath('//*[@id="9"]');
    
    const student_name = await page.$eval(
      '#id_field_student_name2',
      (element) => element.innerHTML
    ); // get your name
    console.log(student_name);

    //let gradebook = await page.$x("//a[contains(text(), 'Gradebook')]");
    let gradebook = await page.evaluateHandle(
      (text) => [...document.querySelectorAll('a')].find((a) => a.innerText === text),
      'Gradebook'
    );
    console.log(gradebook.length);
    await gradebook.click(); //clicks on gradebook link
    await page.waitForSelector('.pagetitle');

    let classes = await page.$$eval('#section_5 .arrowizer tbody tr', (anchors) => {
      return anchors.map((anchor) => anchor.textContent);
    });
    // gets your classes in a list format
    for (let i = 0; i < classes.length; i++) {
      classes[i] = classes[i].replace(/(\r\n|\n|\r|\t|)/gm, '');
      classes[i] = classes[i].replace('[Grades] [Assignments]', '');
    }
    //cleans unnecessary elements
    classes = classes.filter(function (x) {
      return x !== '';
    });
    //removes extra blank elements
    classes.shift(); //removes title

    
    let grade_links = await page.$x("//a[contains(text(), 'Grades')]"); //gets each link with grade in it
    //let gradearr = []; //creats an array for grades
    for (let i = 0; i < grade_links.length; i++) {
      //loops over each link
      await grade_links[i].click(); //clicks on grade link
      await page.waitForSelector('td.content1');
      let [grade_object] = await page.$x('//*[@id="section_5"]/tr[2]/td/table/tbody/tr[2]/td[5]');
      let class_grade = await (await grade_object.getProperty('textContent')).jsonValue();

      classes[i] += class_grade; // adds grades to corresponding classes

      //gradearr.push(faw)
      await page.goBack();
      await page.waitForSelector('td.content1');
      grade_links = await page.$x("//a[contains(text(), 'Grades')]");
    }
    console.log(classes);

    await page.close();

    return [student_name, classes];
  }

  app.listen(port, () => {
    console.log('server on');
  });
})();
