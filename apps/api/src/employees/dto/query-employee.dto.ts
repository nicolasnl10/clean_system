import { IsEnum, IsOptional, IsString } from 'class-validator'
import { EmployeeStatus } from '@prisma/client'

export class QueryEmployeeDto {
  @IsString()
  @IsOptional()
  search?: string

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus
}
