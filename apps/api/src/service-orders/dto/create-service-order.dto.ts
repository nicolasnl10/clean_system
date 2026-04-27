import { IsUUID } from 'class-validator'

export class CreateServiceOrderDto {
  @IsUUID()
  appointmentId: string
}
