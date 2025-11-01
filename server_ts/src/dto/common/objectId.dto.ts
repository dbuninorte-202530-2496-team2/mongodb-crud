import { Type } from 'class-transformer';
import { IsMongoId } from 'class-validator';

export class ObjectIdDto {
  @IsMongoId({ message: 'ID inválido' })
  @Type(() => String)
  id!: string;
}