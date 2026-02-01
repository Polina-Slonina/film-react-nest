import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config'
import { TskvLogger } from './logger/tskv.logger';
import { DevLogger } from './logger/dev.logger';
import { JsonLogger } from './logger/json.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.setGlobalPrefix("api/afisha");
  app.enableCors();
  app.useLogger(new DevLogger());
  app.useLogger(new JsonLogger());
  app.useLogger(new TskvLogger());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
