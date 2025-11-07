import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: 'Coding' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Coding exam' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: ['technology'], required: false, type: [String] })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array of strings' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiProperty({ example: 'Technology', required: false })
  @IsOptional()
  category?: string;
}
