import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { Payment } from '../payments/payment.entity';
import { Person } from '../persons/person.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_DATABASE || 'payments',
  entities: [Payment, Person],
  synchronize: true,
};
