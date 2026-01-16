import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './payment.entity';
import { PaymentConfirmedEvent } from './events/payment-confirmed.event';
import { Person } from '../persons/person.entity';
import { PaymentReceipt } from './payment-receipt';

export interface ConfirmPaymentInput {
  amount: number;
  currency: string;
  reference: string;
  personId: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Person)
    private readonly personsRepository: Repository<Person>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async confirmPayment(
    input: ConfirmPaymentInput,
  ): Promise<{ payment: Payment; receipt: PaymentReceipt }> {
    try {
      const person = await this.personsRepository.findOne({
        where: { id: input.personId },
      });

      if (!person) {
        this.logger.warn(`Confirm FAILED personId = ${input.personId} not found`);
        throw new NotFoundException('Person not found');
      }

      const payment = this.paymentsRepository.create({
        amount: input.amount.toFixed(2),
        currency: input.currency.toUpperCase(),
        reference: input.reference,
        status: PaymentStatus.PAID,
        person,
      });

      const saved = await this.paymentsRepository.save(payment);
      const receipt: PaymentReceipt = {
        paymentId: saved.id,
        reference: saved.reference,
        amount: saved.amount,
        currency: saved.currency,
        personName: person.name,
        personEmail: person.email,
        createdAt: saved.createdAt,
      };

      this.eventEmitter.emit(
        'payment.confirmed',
        new PaymentConfirmedEvent(receipt),
      );

      this.logger.log(
        `Confirm OK id = ${saved.id} amount = ${saved.amount} currency = ${saved.currency} reference = ${saved.reference}`,
      );

      return { payment: saved, receipt };
    } catch (error) {
      this.logger.error(
        `Confirm FAILED personId=${input.personId} reference=${input.reference}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async listPayments(): Promise<Payment[]> {
    try {
      const payments = await this.paymentsRepository.find({
        relations: ['person'],
        order: { createdAt: 'DESC' },
      });
      this.logger.log(`list ok count=${payments.length}`);
      return payments;
    } catch (error) {
      this.logger.error(
        'List FAILED',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async listPaymentsByPerson(personId: string): Promise<Payment[]> {
    try {
      const payments = await this.paymentsRepository.find({
        where: { person: { id: personId } },
        relations: ['person'],
        order: { createdAt: 'DESC' },
      });
      this.logger.log(
        `list by person ok personId=${personId} count=${payments.length}`,
      );
      return payments;
    } catch (error) {
      this.logger.error(
        `list by person failed personId=${personId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
