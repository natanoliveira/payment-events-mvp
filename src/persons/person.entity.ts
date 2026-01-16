import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from '../payments/payment.entity';

@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 160 })
  email!: string;

  @Column({ length: 30 })
  document!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @OneToMany(() => Payment, (payment) => payment.person)
  payments!: Payment[];
}
