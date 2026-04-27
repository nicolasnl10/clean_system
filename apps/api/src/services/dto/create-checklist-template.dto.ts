import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class CreateChecklistTemplateDto {
  @IsString()
  itemName: string

  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number
}
