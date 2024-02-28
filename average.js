const express = require('express');
const app = express();

let ratings = [];

app.get('/average', (req, res) => {
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  const average = total / ratings.length;
  res.json({ average });
});

app.post('/rating', (req, res) => {
  const rating = req.body.rating;
  ratings.push(rating);
  res.sendStatus(200);
});

app.listen(80, () => {
  console.log('Server listening on port 80');
});