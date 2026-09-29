import { Module } from '@nestjs/common';
import { InstallmentService } from './installment.service';
import { InstallmentController } from './installment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Installment } from './entities/installment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Installment])],
  providers: [InstallmentService],
  controllers: [InstallmentController],
  exports: [InstallmentService]
})
export class InstallmentModule { }
