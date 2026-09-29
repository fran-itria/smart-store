import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { databaseImports } from './config/database';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './order/order.module';
import { InstallmentModule } from './installment/installment.module';

const domainModules =
  process.env.NODE_ENV === 'test'
    ? []
    : [AuthModule, UsersModule, ProductsModule, CategoriesModule, OrdersModule];
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ...databaseImports,
    ...domainModules,
    InstallmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
