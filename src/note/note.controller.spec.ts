import { Test, TestingModule } from '@nestjs/testing';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { Types } from 'mongoose';
import { CreateNoteDto, UpdateNoteDto } from './dto';

const mockUser = {
  id: '690bfdd72ebb06608874d365',
  email: 'test@gmail.com',
  firstName: 'Test',
  lastName: 'User',
  provider: 'google',
};

const mockNoteId = '690c13c0f8109709d23a4c5d';

const mockNotes = [
  {
    _id: new Types.ObjectId('690c13c0f8109709d23a4c5d'),
    title: 'Test note',
    content: 'Test content',
    user: new Types.ObjectId('690bfdd72ebb06608874d365'),
    tags: ['technology'],
    category: 'Technology',
    createdAt: new Date('2025-11-06T05:27:01.172Z'),
    updatedAt: new Date('2025-11-06T05:27:01.172Z'),
    save: jest.fn(),
  },
  {
    _id: new Types.ObjectId('690c31a5993c3f1303833347'),
    title: 'Test note2',
    content: 'Test content2',
    user: new Types.ObjectId('690bfdd72ebb06608874d365'),
    tags: ['technology'],
    category: 'Technology',
    createdAt: new Date('2025-11-06T05:27:01.172Z'),
    updatedAt: new Date('2025-11-06T05:27:01.172Z'),
    save: jest.fn(),
  },
];

const mockPaginatedNotes = {
  data: mockNotes,
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const updateDto: UpdateNoteDto = {
  title: 'Update note',
  content: 'Update content',
  tags: ['technology'],
  category: 'Technology',
};

describe('NoteController', () => {
  let controller: NoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [
        NoteService,
        {
          provide: NoteService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation((dto: CreateNoteDto) =>
                Promise.resolve({ ...mockNotes[0], ...dto }),
              ),
            findAll: jest.fn().mockResolvedValue(mockPaginatedNotes),
            findOne: jest.fn().mockResolvedValue(mockNotes[0]),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockNotes[0], ...updateDto }),
            remove: jest.fn().mockResolvedValue(mockNotes[0]),
          },
        },
      ],
    }).compile();

    controller = module.get<NoteController>(NoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new note successfully', async () => {
      const dto: CreateNoteDto = {
        title: 'Test note',
        content: 'Test content',
        tags: ['technology'],
        category: 'Technology',
      };

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(mockNotes[0]);
    });
  });

  describe('findAll()', () => {
    it('should retrieve paginated notes', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query, mockUser);

      expect(result).toEqual(mockPaginatedNotes);
    });
  });

  describe('findOne()', () => {
    it('should retrieve a single note', async () => {
      const result = await controller.findOne(mockNoteId, mockUser);

      expect(result).toEqual(mockNotes[0]);
    });
  });

  describe('update()', () => {
    it('should update a note successfully', async () => {
      const updatedNote = {
        ...mockNotes[0],
        ...updateDto,
      };

      const result = await controller.update(mockNoteId, updateDto, mockUser);

      expect(result).toEqual(updatedNote);
    });
  });

  describe('remove()', () => {
    it('should remove note successfully', async () => {
      const result = await controller.remove(mockNoteId, mockUser);

      expect(result).toEqual(mockNotes[0]);
    });
  });
});
