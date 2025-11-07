import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators/role.decorator';
import { Role } from '../common/conts';
import { PaginateDto } from '../common/dtos';
import { AssignRoleDto } from './dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve users list' })
  @Roles(Role.Admin)
  async findAll(@Query() query: PaginateDto) {
    return await this.userService.findAll(query);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user role' })
  @Roles(Role.Admin)
  async assignRole(@Body() dto: AssignRoleDto) {
    return await this.userService.assignRole(dto);
  }
}
