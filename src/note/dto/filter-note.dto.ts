import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateDto } from '../../common/dtos';
import { IsOptional, IsString } from 'class-validator';

export class FilterNoteDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Comma-separated tags to filter notes (e.g. technology,urgent)',
    example: 'technology,typescript',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Category name to filter notes',
    example: 'Technology',
  })
  @IsOptional()
  @IsString()
  category?: string;
}
