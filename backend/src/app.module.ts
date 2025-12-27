import { Module } from '@nestjs/common';
import {ServeStaticModule} from "@nestjs/serve-static";
import {ConfigModule, ConfigService} from "@nestjs/config";
import { join } from 'path';
import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from "node:path";
import {configProvider, database} from "./app.config.provider";

@Module({
  imports: [
	ConfigModule.forRoot({
          isGlobal: true,
          cache: true
      }),
  MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL', database.url),
      }),
      inject: [ConfigService],
    }),
  ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'public/content/afisha'),
          serveRoot: '/content/afisha',
          serveStaticOptions: {
            index: false, // ОТКЛЮЧАЕМ поиск index.html
          },
    }),
  FilmsModule,
  OrderModule,
      // @todo: Добавьте раздачу статических файлов из public
  ],
  controllers: [],
  providers: [configProvider],
})
export class AppModule {}
