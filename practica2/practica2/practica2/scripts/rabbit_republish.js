#!/usr/bin/env node
/*
  Usage:
    IDENTITY=your-key node scripts/rabbit_republish.js '{"reservationId":1,"spaceId":1}'
  Or set env vars:
    RABBITMQ_URL, IDEMPOTENCY_KEY
*/
const amqp = require('amqplib');

async function main() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const idempotencyKey = process.env.IDEMPOTENCY_KEY || process.argv[3] || 'test-key-123';
  const payloadArg = process.argv[2] || null;
  let payload = {};
  if (payloadArg) {
    try { payload = JSON.parse(payloadArg); } catch (e) { console.error('Invalid JSON payload'); process.exit(1); }
  }
  payload.idempotencyKey = idempotencyKey;

  const exchange = 'amq.topic';
  const routingKey = 'reservation.created';

  const conn = await amqp.connect(url);
  const ch = await conn.createChannel();
  await ch.assertExchange(exchange, 'topic', { durable: true });
  const ok = ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
  console.log('Published', { exchange, routingKey, payload, ok });
  await ch.close();
  await conn.close();
}

main().catch(err => { console.error(err); process.exit(1); });
