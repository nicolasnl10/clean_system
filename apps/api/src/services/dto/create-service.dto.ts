import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateServiceDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDurationMinutes?: number

  @IsNumber()
  @Min(0)
  basePrice: number

  @IsBoolean()
  @IsOptional()
  active?: boolean
}
