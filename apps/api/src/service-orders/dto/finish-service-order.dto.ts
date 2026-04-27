import { IsOptional, IsString } from 'class-validator'

export class FinishServiceOrderDto {
  @IsString()
  @IsOptional()
  clientSignature?: string

  @IsString()
  @IsOptional()
  observations?: string
}
