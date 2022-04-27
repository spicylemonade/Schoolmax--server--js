let z = 0;

function getapi() {
  console.log(z);
  const name = document.getElementById('name').value;
  const pass = document.getElementById('pass').value;
  const payload = { name, pass };
  console.log(payload);
  const options = {
    method: 'POST',
    body: JSON.stringify({ payload }),
    headers: { 'Content-type': 'application/json' },
  };
  fetch('https://school-max.herokuapp.com/api', options)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      localStorage.setItem('data', data);
      console.log(data);
      window.location.assign('./nex.html');
      //window.location.href='./nex.html'
    });
}
