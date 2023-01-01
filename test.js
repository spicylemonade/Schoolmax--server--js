var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let count = 0;
let startTime;
let looper = 2;
function sendRequest() {
  const request = new XMLHttpRequest();
  request.open("GET", "http://localhost:5000/get-grades", true);
  request.onload = function () {
    count++;
    if (count === looper) {
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      console.log(
        `It took ${duration} seconds to complete all ${looper} requests.`
      );
    } else if (count < looper) {
      sendRequest();
    }
  };
  request.send();
}

startTime = performance.now();
sendRequest();
