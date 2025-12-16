import { Transport } from '@nestjs/microservices';

const rmqUrls = [process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672'];

export const transportConfig = {
  reservations: {
    urls: rmqUrls,
  },
  spaces: {
    urls: rmqUrls,
  },
};