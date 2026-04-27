import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { EmployeeStatus } from '@prisma/client'

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  cpf?: string

  @IsString()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  position?: string

  @IsDateString()
  @IsOptional()
  hireDate?: string

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus

  @IsString()
  @IsOptional()
  availabilityNotes?: string
}
