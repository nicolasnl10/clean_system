import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { AppointmentStatus } from '@prisma/client'

export class QueryAppointmentDto {
  @IsDateString()
  @IsOptional()
  date?: string

  @IsDateString()
  @IsOptional()
  startDate?: string

  @IsDateString()
  @IsOptional()
  endDate?: string

  @IsUUID()
  @IsOptional()
  teamId?: string

  @IsUUID()
  @IsOptional()
  clientId?: string

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus
}
