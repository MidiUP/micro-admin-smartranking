import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://user:i1k7st2vIWk9@44.204.159.57:5672/smartranking'],
      noAck: false,
      queue: 'admin-backend',
    },
  });

  await app.listen();
  logger.log('Microservice is listening');
}
bootstrap();
