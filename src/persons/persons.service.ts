import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { formatPersonName } from '../common/format-person-name';

export interface CreatePersonInput {
  name: string;
  email: string;
  document: string;
}

@Injectable()
export class PersonsService {
  private readonly logger = new Logger(PersonsService.name);

  constructor(
    @InjectRepository(Person)
    private readonly personsRepository: Repository<Person>,
  ) { }

  async create(input: CreatePersonInput): Promise<Person> {
    try {
      const person = this.personsRepository.create({
        ...input,
        name: formatPersonName(input.name),
      });
      const saved = await this.personsRepository.save(person);
      this.logger.log(`Create OK id = ${saved.id} email = ${saved.email}`);
      return saved;
    } catch (error) {
      this.logger.error(
        `Create FAILED email = ${input.email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async list(): Promise<Person[]> {
    try {
      const persons = await this.personsRepository.find({
        order: { createdAt: 'DESC' },
      });
      this.logger.log(`list ok count=${persons.length}`);
      return persons;
    } catch (error) {
      this.logger.error(
        'List FAILED',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
