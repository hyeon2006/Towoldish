const express = require('express');
const bodyParser = require('body-parser');
const cron = require('cron');

const app = express();
app.use(bodyParser.json());

let ratings = [];

app.get('/average', (req, res) => {
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  const average = total / ratings.length;
  res.json({ average });
});

app.get('/rating', (req, res) => {
  const rating = req.query.rating;
  ratings.push(rating);
  res.sendStatus(200);
});

const initializeAverage = () => {
  ratings = [];
};

cron.schedule('0 0 * * *', initializeAverage);

app.listen(80, () => {
  console.log('Server listening on port 80');
});

// Redirect to rating.html with the average rating as a query parameter
location.href = 'rating.html?averageRating=' + averageRating;
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] === variable) {
      return decodeURIComponent(pair[1].replace(/\+/g, ' '));
    }
  }
  return null;
}

// Get the average rating from the URL
var averageRating = getQueryVariable('averageRating');

// Display the average rating in your HTML
document.getElementById('averageRating').innerText = '평균 등급: ' + averageRating;