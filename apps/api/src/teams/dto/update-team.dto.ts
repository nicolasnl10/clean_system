import { IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsUUID()
  @IsOptional()
  supervisorId?: string
}
