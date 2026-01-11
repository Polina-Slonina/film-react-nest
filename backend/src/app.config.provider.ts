import {ConfigModule } from "@nestjs/config";

export const database = {
    driver: process.env.DATABASE_DRIVER || 'mongodb',
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/afisha',
    username: process.env.DATABASE_USERNAME || 'student',
    password: process.env.DATABASE_PASSWORD || 'polina'
};

export const configProvider = {
    imports: [ConfigModule.forRoot()],
    provide: 'CONFIG',
    useValue: < AppConfig> {
       database
        //TODO прочесть переменнные среды
    },
}

export interface AppConfig {
    database: AppConfigDatabase
}

export interface AppConfigDatabase {
    driver: string
    url: string
    username: string
    password: string
}
