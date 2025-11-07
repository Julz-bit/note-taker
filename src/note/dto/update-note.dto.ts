import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({ example: 'Coding' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @ApiProperty({ example: 'Coding exam' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  content: string;

  @ApiProperty({ example: ['technology'], required: false, type: [String] })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array of strings' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiProperty({ example: 'Technology', required: false })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;
}
