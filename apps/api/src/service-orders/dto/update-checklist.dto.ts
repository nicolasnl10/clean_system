import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ChecklistItemDto {
  @IsUUID()
  id: string

  @IsBoolean()
  completed: boolean

  @IsString()
  @IsOptional()
  notes?: string
}

export class UpdateChecklistDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items: ChecklistItemDto[]
}
