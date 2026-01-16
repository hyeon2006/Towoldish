import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'likes.json.gz');

app.use(cors());
app.use(bodyParser.json());

let likesCache = {};

function loadDatabase() {
    if (fs.existsSync(DB_FILE)) {
        try {
            const compressed = fs.readFileSync(DB_FILE);
            const decompressed = zlib.gunzipSync(compressed);
            likesCache = JSON.parse(decompressed.toString());
            console.log('📂 Database loaded.');
        } catch {
            likesCache = {};
        }
    } else {
        likesCache = {};
    }
}

function saveDatabase() {
    try {
        const jsonStr = JSON.stringify(likesCache);
        const compressed = zlib.gzipSync(jsonStr);
        fs.writeFileSync(DB_FILE, compressed);
    } catch (e) {
        console.error('Save failed:', e);
    }
}

loadDatabase();

// --- API ---

app.get('/likes', (req, res) => {
    const { date } = req.query;
    if (!date) return res.json(likesCache);

    const filtered = Object.keys(likesCache)
        .filter((key) => key.startsWith(date))
        .reduce((obj, key) => {
            obj[key] = likesCache[key];
            return obj;
        }, {});

    res.json(filtered);
});

app.post('/like', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).send('Missing ID');

    if (!likesCache[id]) likesCache[id] = 0;
    likesCache[id] += 1;

    saveDatabase();
    res.json({ success: true, count: likesCache[id] });
});

app.post('/unlike', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).send('Missing ID');

    if (likesCache[id] && likesCache[id] > 0) {
        likesCache[id] -= 1;
    } else {
        likesCache[id] = 0;
    }

    saveDatabase();
    res.json({ success: true, count: likesCache[id] });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
