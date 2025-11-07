import { ApiProperty } from '@nestjs/swagger';

export class NoteEntity {
  @ApiProperty({ example: '690c193472922bf48801c303' })
  _id: string;

  @ApiProperty({ example: 'Coding' })
  title: string;

  @ApiProperty({ example: 'Coding exam' })
  content: string;

  @ApiProperty({ example: ['technology'] })
  tags: string[];

  @ApiProperty({ example: 'Technology' })
  category: string;

  @ApiProperty({ example: '690c18ed72922bf48801c2f6' })
  user: string;

  @ApiProperty({ example: '2025-11-06T03:42:44.484Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-06T03:42:44.484Z' })
  updatedAt: Date;

  @ApiProperty({ example: 0 })
  __v: number;
}

export class PaginatedNotesEntity {
  @ApiProperty({ type: [NoteEntity] })
  data: NoteEntity[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
