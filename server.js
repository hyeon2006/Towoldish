const express = require('express');
const app = express();

let ratings = []; // 빈 배열로 초기화합니다.

// 매일 자정에 ratings 배열을 초기화합니다.
const resetRatings = () => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
    ratings = [];
    console.log('Ratings array initialized.');
  }
};
setInterval(resetRatings, 1000); // 1초마다 resetRatings 함수를 호출합니다.

app.get('/', (req, res) => {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const rating = parseInt(urlParams.get('rating'));

  // ratings 배열에 등급 값을 추가합니다.
  ratings.push(rating);

  res.send(`등급 값 받기: ${rating}`);
});

// 등급 평균을 계산합니다.
app.get('/average', (req, res) => {
  const sum = ratings.reduce((a, b) => a + b, 0);
  const average = sum / ratings.length;
  res.json({ average });
});

app.listen(3000, () => {
  console.log('서버 대기 중: 포트 3000');
});