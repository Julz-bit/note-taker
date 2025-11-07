import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/conts';

export class UserEntity {
  @ApiProperty({ example: '690c31a5993c3f1303833344' })
  _id: string;

  @ApiProperty({ example: 'test1@gmail.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/a/ACg8ocJyEF' })
  picture: string;

  @ApiProperty({ example: 'google' })
  provider: string;

  @ApiProperty({ example: Role.User })
  role: string;

  @ApiProperty({ example: '2025-11-06T03:42:44.484Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-06T03:42:44.484Z' })
  updatedAt: Date;

  @ApiProperty({ example: 0 })
  __v: number;
}

export class PaginatedUsersEntity {
  @ApiProperty({ type: [UserEntity] })
  data: UserEntity[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
