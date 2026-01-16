import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Person } from './person.entity';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';

@ApiTags('persons')
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @ApiOperation({ summary: 'Criar pessoa' })
  @ApiBody({ type: CreatePersonDto })
  @ApiCreatedResponse({ description: 'Pessoa criada', type: Person })
  @Post()
  async create(@Body() body: CreatePersonDto) {
    return this.personsService.create(body);
  }

  @ApiOperation({ summary: 'Listar pessoas' })
  @ApiOkResponse({ description: 'Lista de pessoas', type: Person, isArray: true })
  @Get()
  async list() {
    return this.personsService.list();
  }
}
