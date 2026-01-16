import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/typeorm.config';
import { PaymentsModule } from './payments/payments.module';
import { SendEmailListener } from './listeners/send-email.listener';
import { GenerateReceiptListener } from './listeners/generate-receipt.listener';
import { PersonsModule } from './persons/persons.module';
import { Payment } from './payments/payment.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Payment]),
    PaymentsModule,
    PersonsModule,
  ],
  providers: [SendEmailListener, GenerateReceiptListener],
})
export class AppModule {}
