module.exports = {
	"env": {
		"amd": ture, //require
		"node": true, //module
	}
}
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// 배열 초기화
let ratings = [];

// 클라이언트로부터 평가 값을 받아 배열에 추가
app.post('script.js', (req, res) => {
    const { rating } = req.body;
    ratings.push(rating);
    res.send('평가가 성공적으로 추가되었습니다.');
});

// 배열의 평균값을 계산하는 엔드포인트
app.get('/averageRating', (req, res) => {
    const sum = ratings.reduce((acc, curr) => acc + curr, 0);
    const average = sum / ratings.length;
    res.send(`평균 평가 점수: ${average}`);
});

app.listen(3000, () => {
    console.log('서버가 포트 3000에서 실행 중입니다.');
});

document.getElementById('output').innerText = average;