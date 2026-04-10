
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

let cache = { data: null, updatedAt: 0 };

const SHEET_ID = '16X6WVCMDCdjlSienfe2we2M-Ljcvfw7MSFyYfQO5Y7s';
const API_KEY = 'AIzaSyAiq4iGYcWemyoF1JhS-cD2oM-gMF2LdOY';
const RANGE = 'COMB1!A1:F9';

async function refreshCache() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    console.log('Fetching URL:', url);
    const res = await fetch(url);
    const text = await res.text();
    console.log('Response:', text.substring(0, 300));
    const json = JSON.parse(text);
    cache = { data: json.values, updatedAt: Date.now() };
    console.log('Cache refreshed successfully!');
  } catch (e) {
    console.error('Refresh failed:', e.message);
  }
}

refreshCache();
setInterval(refreshCache, 30_000);

app.get('/api/data', (req, res) => {
  res.json({ data: cache.data, updatedAt: cache.updatedAt });
});

app.listen(3000, () => console.log('Server running on port 3000'));