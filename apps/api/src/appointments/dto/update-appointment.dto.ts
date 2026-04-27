import { IsDateString, IsEnum, IsOptional, IsUUID, IsString, Matches } from 'class-validator'
import { AppointmentFrequency } from '@prisma/client'

export class UpdateAppointmentDto {
  @IsUUID()
  @IsOptional()
  serviceId?: string

  @IsUUID()
  @IsOptional()
  teamId?: string

  @IsDateString()
  @IsOptional()
  scheduledDate?: string

  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime deve estar no formato HH:MM' })
  @IsOptional()
  startTime?: string

  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime deve estar no formato HH:MM' })
  @IsOptional()
  endTime?: string

  @IsEnum(AppointmentFrequency)
  @IsOptional()
  frequency?: AppointmentFrequency

  @IsString()
  @IsOptional()
  notes?: string
}
