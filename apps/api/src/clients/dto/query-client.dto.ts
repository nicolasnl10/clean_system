import { IsEnum, IsOptional, IsString } from 'class-validator'
import { CustomerType } from '@prisma/client'

export class QueryClientDto {
  @IsString()
  @IsOptional()
  search?: string

  @IsEnum(CustomerType)
  @IsOptional()
  customerType?: CustomerType
}
