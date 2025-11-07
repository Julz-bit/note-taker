import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { Role } from '../../common/conts';

export class AssignRoleDto {
  @ApiProperty({ example: '690bfdd72ebb06608874d365' })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: Role, example: Role.Admin })
  @IsNotEmpty()
  @IsIn([Role.Admin, Role.User])
  role: string;
}
