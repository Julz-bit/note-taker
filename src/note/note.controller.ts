import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { NoteService } from './note.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from '../common/types';
import { NoteEntity, PaginatedNotesEntity } from './entities';
import { CreateNoteDto, FilterNoteDto, UpdateNoteDto } from './dto';
import { ParseObjectIdPipe } from '../common/pipes';

@ApiTags('Note')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiCreatedResponse({
    description: 'Note created successfully',
    type: NoteEntity,
  })
  async create(@Body() createNoteDto: CreateNoteDto, @Auth() user: AuthUser) {
    return await this.noteService.create(createNoteDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve notes of authenticated user' })
  @ApiOkResponse({ description: 'Notes retrieved', type: PaginatedNotesEntity })
  async findAll(@Query() query: FilterNoteDto, @Auth() user: AuthUser) {
    return await this.noteService.findAll(query, user.id);
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Retrieve note via ID' })
  @ApiOkResponse({ description: 'Note retrieved', type: NoteEntity })
  @ApiNotFoundResponse({ description: 'Note not found' })
  async findOne(
    @Param('noteId', new ParseObjectIdPipe()) id: string,
    @Auth() user: AuthUser,
  ) {
    return await this.noteService.findOne(id, user.id);
  }

  @Put(':noteId')
  @ApiOperation({ summary: 'Update a note owned by the authenticated user' })
  @ApiOkResponse({ description: 'Note updated successfully', type: NoteEntity })
  @ApiNotFoundResponse({ description: 'Note not found' })
  @ApiForbiddenResponse({ description: 'User not allowed to modify this note' })
  async update(
    @Param('noteId', new ParseObjectIdPipe()) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Auth() user: AuthUser,
  ) {
    return await this.noteService.update(id, updateNoteDto, user.id);
  }

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete a note owned by the authenticated user' })
  @ApiOkResponse({ description: 'Note deleted successfully', type: NoteEntity })
  @ApiNotFoundResponse({ description: 'Note not found' })
  @ApiForbiddenResponse({ description: 'User not allowed to delete this note' })
  async remove(
    @Param('noteId', new ParseObjectIdPipe()) id: string,
    @Auth() user: AuthUser,
  ) {
    return await this.noteService.remove(id, user.id);
  }
}
