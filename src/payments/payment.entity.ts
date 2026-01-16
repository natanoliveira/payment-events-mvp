import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from '../persons/person.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: string;

  @Column({ length: 3 })
  currency!: string;

  @Column({ length: 80 })
  reference!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: PaymentStatus;

  @Column({ type: 'boolean', default: false })
  emailSent!: boolean;

  @ManyToOne(() => Person, (person) => person.payments, { nullable: false })
  person!: Person;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
