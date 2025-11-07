import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from './note.service';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Note } from './schemas';
import { CreateNoteDto, UpdateNoteDto } from './dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockUserId = '690bfdd72ebb06608874d365';

const mockNote = {
  _id: new Types.ObjectId('690c13c0f8109709d23a4c5d'),
  title: 'Test note',
  content: 'Test content',
  user: '690bfdd72ebb06608874d365',
  tags: ['technology'],
  category: 'Technology',
  createdAt: new Date('2025-11-06T05:27:01.172Z'),
  updatedAt: new Date('2025-11-06T05:27:01.172Z'),
  save: jest.fn(),
};

describe('NoteService', () => {
  let service: NoteService;
  let noteModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        {
          provide: getModelToken(Note.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
    noteModel = module.get(getModelToken(Note.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const dto: CreateNoteDto = {
        title: 'Test note',
        content: 'Test content',
        tags: ['technology'],
        category: 'Technology',
      };

      noteModel.create.mockResolvedValue(mockNote);

      const result = await service.create(dto, mockUserId);

      expect(result).toEqual(mockNote);
    });
  });

  describe('findAll', () => {
    it('should return paginated notes', async () => {
      const query = { page: 1, limit: 10 };
      const mockResults = [
        mockNote,
        { ...mockNote, _id: new Types.ObjectId() },
      ];

      const mockExecChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockResults),
      };

      noteModel.find.mockReturnValue(mockExecChain);
      noteModel.countDocuments.mockResolvedValue(2);

      const result = await service.findAll(query, mockUserId);

      expect(result).toEqual({
        data: mockResults,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if note not found', async () => {
      noteModel.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(mockNote._id.toString(), mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return note if found', async () => {
      noteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.findOne(mockNote._id.toString(), mockUserId);

      expect(result).toEqual(mockNote);
    });
  });

  describe('update', () => {
    const dto: UpdateNoteDto = {
      title: 'Update note',
      content: 'Update content',
      tags: ['technology'],
      category: 'Technology',
    };

    it('should throw NotFoundException if note not found', async () => {
      noteModel.findById.mockResolvedValue(null);

      await expect(
        service.update(mockNote._id.toString(), dto, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update note successfully', async () => {
      const updatedNote = { ...mockNote, ...dto };
      noteModel.findById.mockResolvedValue(mockNote);
      mockNote.save.mockResolvedValue(updatedNote);

      const result = await service.update(
        mockNote._id.toString(),
        dto,
        mockUserId,
      );

      expect(mockNote.save).toHaveBeenCalled();
      expect(result).toEqual(updatedNote);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if note not found', async () => {
      noteModel.findById.mockResolvedValue(null);
      await expect(
        service.remove(mockNote._id.toString(), mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should thow ForbiddenException if user is not the owner of the note', async () => {
      noteModel.findById.mockResolvedValue({
        ...mockNote,
        user: '690bfdd72ebb06608874d360',
      });
      await expect(
        service.remove(mockNote._id.toString(), mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should remove note successfully', async () => {
      noteModel.findById.mockResolvedValue(mockNote);
      noteModel.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      const result = await service.remove(mockNote._id.toString(), mockUserId);

      expect(result).toEqual(mockNote);
    });
  });
});
