import { IsUUID } from 'class-validator'

export class AddMemberDto {
  @IsUUID()
  employeeId: string
}
