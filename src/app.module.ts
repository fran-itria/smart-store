import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from "@nestjs/schedule";
import { databaseImports } from './config/database';


const domainModules =
  process.env.NODE_ENV === 'test'
    ? []
    : [
    ];
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ...databaseImports,
    ...domainModules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
