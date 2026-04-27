import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator'
import { AppointmentFrequency } from '@prisma/client'

export class CreateAppointmentDto {
  @IsUUID()
  clientId: string

  @IsUUID()
  serviceId: string

  @IsUUID()
  teamId: string

  @IsDateString()
  scheduledDate: string

  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime deve estar no formato HH:MM' })
  startTime: string

  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime deve estar no formato HH:MM' })
  endTime: string

  @IsEnum(AppointmentFrequency)
  @IsOptional()
  frequency?: AppointmentFrequency

  @IsString()
  @IsOptional()
  notes?: string
}
