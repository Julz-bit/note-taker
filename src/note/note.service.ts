import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Note } from './schemas';
import { Model, Types } from 'mongoose';
import { CreateNoteDto, FilterNoteDto, UpdateNoteDto } from './dto';
import { PaginatedResult } from '../common/types';

@Injectable()
export class NoteService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    return await this.noteModel.create({
      ...createNoteDto,
      user: new Types.ObjectId(userId),
    });
  }

  async findAll(
    query: FilterNoteDto,
    userId: string,
  ): Promise<PaginatedResult<Note>> {
    const { page, limit, tags, category } = query;

    const filter = {
      user: new Types.ObjectId(userId),
      ...(category && { category }),
      ...(tags && { tags: { $in: tags.split(',').map((tag) => tag.trim()) } }),
    };

    const results = await this.noteModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await this.noteModel.countDocuments(filter);

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.noteModel.findOne({
      _id: new Types.ObjectId(id),
      user: new Types.ObjectId(userId),
    });
    if (!note) throw new NotFoundException(`Note not found`);
    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    userId: string,
  ): Promise<Note> {
    const note = await this.noteModel.findById(id);
    if (!note) throw new NotFoundException(`Note not found`);

    if (note.user.toString() !== userId) {
      throw new ForbiddenException('User not allowed to modify this note');
    }

    Object.assign(note, updateNoteDto);
    await note.save();
    return note;
  }

  async remove(id: string, userId: string): Promise<Note> {
    const note = await this.noteModel.findById(id);

    if (!note) throw new NotFoundException('Note not found');

    if (note.user.toString() !== userId) {
      throw new ForbiddenException('User not allowed to delete this note');
    }

    await this.noteModel.deleteOne({ _id: id });
    return note;
  }
}
