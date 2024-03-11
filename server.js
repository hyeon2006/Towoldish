const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ratingArray = [];

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/addRating", (req, res) => {
  const rating = req.body.rating;
  ratingArray.push(rating);
  const average = ratingArray.reduce((a, b) => a + b, 0) / ratingArray.length;
  res.json({ average });
});

app.get("/getAverage", (req, res) => {
  const average = ratingArray.reduce((a, b) => a + b, 0) / ratingArray.length;
  res.json({ average });
});

// 매일 자정에 ratingArray 배열 초기화
const cron = require("node-cron");
cron.schedule("0 0 * * *", () => {
  console.log("ratingArray 배열을 초기화합니다.");
  ratingArray.length = 0;
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});