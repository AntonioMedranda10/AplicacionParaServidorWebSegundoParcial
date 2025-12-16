const axios = require('axios');
const { v4: uuid } = require('uuid');

async function run() {
  const id = uuid();
  console.log('Using idempotency key', id);
  const url = process.env.URL || 'http://localhost:3000/gateway/reservations';
  const body = { espacioId: '1', fecha: '2025-10-20' };

  for (let i = 0; i < 2; i++) {
    try {
      const res = await axios.post(url, body, { headers: { 'x-idempotency-key': id } });
      console.log('Response', res.data);
    } catch (err) {
      console.error('Error', err.response ? err.response.data : err.message);
    }
  }
}

run();
