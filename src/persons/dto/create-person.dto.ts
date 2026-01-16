import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ example: 'Ana Souza' })
  name!: string;

  @ApiProperty({ example: 'ana.souza@example.com' })
  email!: string;

  @ApiProperty({ example: '111.111.111-11' })
  document!: string;
}
