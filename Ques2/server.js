const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;
const VALID_IDS = ['p', 'f', 'e', 'r'];

app.use(cors());
app.use(express.json());

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0OTU3MTk1LCJpYXQiOjE3NDQ5NTY4OTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImI4MjdhY2Y1LTI3YjYtNGU1MC04NzE3LWEzMmJkMTExNGQ5ZiIsInN1YiI6Imt1c2hhZ3JhLnZhcnNobmV5X2NzLmNzZjIyQGdsYS5hYy5pbiJ9LCJlbWFpbCI6Imt1c2hhZ3JhLnZhcnNobmV5X2NzLmNzZjIyQGdsYS5hYy5pbiIsIm5hbWUiOiJrdXNoYWdyYSB2YXJzaG5leSIsInJvbGxObyI6IjIyMTUzMDAwMjUiLCJhY2Nlc3NDb2RlIjoiQ05uZUdUIiwiY2xpZW50SUQiOiJiODI3YWNmNS0yN2I2LTRlNTAtODcxNy1hMzJiZDExMTRkOWYiLCJjbGllbnRTZWNyZXQiOiJ5VnVDVFJSU0dLVmRTWVNCIn0.57l8msGlhjSay3Ox7cSsRNfnvf7KodmdnnSBOzN7I1o';

const numberStore = {
  p: [], f: [], e: [], r: []
};

const API_URLS = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!VALID_IDS.includes(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  try {
    const startTime = Date.now();
    let fetchedNumbers = [];
    try {
      const response = await axios.get(API_URLS[numberid], {
        timeout: TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`
        }
      });
      if (response.data && Array.isArray(response.data.numbers)) {
        fetchedNumbers = response.data.numbers;
      }
    } catch (error) {
      fetchedNumbers = [];
    }
    const fetchDuration = Date.now() - startTime;

    const windowPrevState = [...numberStore[numberid]];

    let currentNumbers = [...new Set([...windowPrevState, ...fetchedNumbers])];

    if (currentNumbers.length > WINDOW_SIZE) {
      currentNumbers = currentNumbers.slice(-WINDOW_SIZE);
    }

    numberStore[numberid] = currentNumbers;

    const avg = currentNumbers.length > 0
      ? (currentNumbers.reduce((sum, num) => sum + num, 0) / currentNumbers.length).toFixed(2)
      : 0;

    const response = {
      windowPrevState,
      windowCurrState: currentNumbers,
      numbers: fetchedNumbers,
      avg: parseFloat(avg)
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {});