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