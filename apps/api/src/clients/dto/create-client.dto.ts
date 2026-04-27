import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'
import { CustomerType } from '@prisma/client'

export class CreateClientDto {
  @IsString()
  name: string

  @IsEnum(CustomerType)
  customerType: CustomerType

  @IsString()
  @IsOptional()
  document?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  addressStreet?: string

  @IsString()
  @IsOptional()
  addressNumber?: string

  @IsString()
  @IsOptional()
  addressComplement?: string

  @IsString()
  @IsOptional()
  neighborhood?: string

  @IsString()
  @IsOptional()
  city?: string

  @IsString()
  @IsOptional()
  state?: string

  @IsString()
  @IsOptional()
  zipCode?: string

  @IsString()
  @IsOptional()
  notes?: string
}
