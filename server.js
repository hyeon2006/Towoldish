const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const serverData = []; // server.js 배열

app.post('/sendRating', (req, res) => {
    const { rating } = req.body;
    serverData.push(rating);
    console.log('Received rating:', rating);
    console.log('Updated server data:', serverData);
    res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});