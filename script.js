const express = require('express');
const app = express();
let ratings = []; // 서버 측 배열 선언

app.get('/save_rating', (req, res) => {
  const rating = req.query.rating;
  ratings.push(rating); // 배열에 값 추가
  console.log(`Received rating: ${rating}`);
  res.send('Rating saved.');
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});