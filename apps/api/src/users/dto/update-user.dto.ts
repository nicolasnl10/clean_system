import { IsEmail, IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator'
import { Role } from '@prisma/client'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsEnum(Role)
  @IsOptional()
  role?: Role

  @IsBoolean()
  @IsOptional()
  active?: boolean
}
