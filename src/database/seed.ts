import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './typeorm.config';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { Person } from '../persons/person.entity';

const personsSeed = [
  { name: 'Ana Souza', email: 'ana.souza@example.com', document: '111.111.111-11' },
  { name: 'Bruno Lima', email: 'bruno.lima@example.com', document: '222.222.222-22' },
  { name: 'Carla Mendes', email: 'carla.mendes@example.com', document: '333.333.333-33' },
  { name: 'Diego Santos', email: 'diego.santos@example.com', document: '444.444.444-44' },
  { name: 'Eduarda Rocha', email: 'eduarda.rocha@example.com', document: '555.555.555-55' },
];

const paymentsSeed = [
  { amount: '129.90', currency: 'BRL', reference: 'ORDER-1001' },
  { amount: '59.00', currency: 'USD', reference: 'ORDER-1002' },
  { amount: '420.50', currency: 'EUR', reference: 'ORDER-1003' },
  { amount: '12.99', currency: 'BRL', reference: 'ORDER-1004' },
  { amount: '249.00', currency: 'USD', reference: 'ORDER-1005' },
  { amount: '78.40', currency: 'EUR', reference: 'ORDER-1006' },
  { amount: '530.00', currency: 'BRL', reference: 'ORDER-1007' },
  { amount: '199.99', currency: 'USD', reference: 'ORDER-1008' },
  { amount: '33.30', currency: 'EUR', reference: 'ORDER-1009' },
  { amount: '87.15', currency: 'BRL', reference: 'ORDER-1010' },
  { amount: '15.00', currency: 'USD', reference: 'ORDER-1011' },
  { amount: '999.90', currency: 'EUR', reference: 'ORDER-1012' },
  { amount: '45.50', currency: 'BRL', reference: 'ORDER-1013' },
  { amount: '310.25', currency: 'USD', reference: 'ORDER-1014' },
  { amount: '66.60', currency: 'EUR', reference: 'ORDER-1015' },
  { amount: '22.10', currency: 'BRL', reference: 'ORDER-1016' },
  { amount: '75.75', currency: 'USD', reference: 'ORDER-1017' },
  { amount: '18.18', currency: 'EUR', reference: 'ORDER-1018' },
  { amount: '420.00', currency: 'BRL', reference: 'ORDER-1019' },
  { amount: '5.99', currency: 'USD', reference: 'ORDER-1020' },
  { amount: '60.00', currency: 'EUR', reference: 'ORDER-1021' },
  { amount: '120.00', currency: 'BRL', reference: 'ORDER-1022' },
  { amount: '89.99', currency: 'USD', reference: 'ORDER-1023' },
  { amount: '210.10', currency: 'EUR', reference: 'ORDER-1024' },
  { amount: '14.40', currency: 'BRL', reference: 'ORDER-1025' },
  { amount: '100.00', currency: 'USD', reference: 'ORDER-1026' },
  { amount: '250.00', currency: 'EUR', reference: 'ORDER-1027' },
];

async function runSeed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  await dataSource.synchronize();

  const paymentRepo = dataSource.getRepository(Payment);
  const personRepo = dataSource.getRepository(Person);

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryRunner.query('TRUNCATE TABLE `payments`');
    await queryRunner.query('TRUNCATE TABLE `persons`');
  } finally {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    await queryRunner.release();
  }

  const persons = await personRepo.save(
    personsSeed.map((person) => personRepo.create(person)),
  );

  const payments = paymentsSeed.map((item, index) =>
    paymentRepo.create({
      ...item,
      status: PaymentStatus.PAID,
      person: persons[index % persons.length],
    }),
  );

  await paymentRepo.save(payments);
  await dataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
