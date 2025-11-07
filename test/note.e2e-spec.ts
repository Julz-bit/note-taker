import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from './../src/note/note.service';
import * as request from 'supertest';
import { NoteController } from './../src/note/note.controller';
import { AuthGuard } from '@nestjs/passport';
import { formatErrors } from './../src/common/utils';
import { CreateNoteDto, FilterNoteDto, UpdateNoteDto } from './../src/note/dto';

describe('NoteController (e2e)', () => {
  let app: INestApplication;
  let noteService: jest.Mocked<NoteService>;

  const mockNotes: any = [
    {
      _id: '690c13c0f8109709d23a4c5d',
      title: 'Test note',
      content: 'Test content',
      user: '690bfdd72ebb06608874d365',
      tags: ['technology'],
      category: 'Technology',
      createdAt: '2025-11-06T05:27:01.172Z',
      updatedAt: '2025-11-06T05:27:01.172Z',
      __v: 0,
    },
    {
      _id: '690c31a5993c3f1303833347',
      title: 'Test note2',
      content: 'Test content2',
      user: '690bfdd72ebb06608874d365',
      tags: ['technology'],
      category: 'Technology',
      createdAt: '2025-11-06T05:27:01.172Z',
      updatedAt: '2025-11-06T05:27:01.172Z',
      __v: 0,
    },
  ];

  const mockPaginatedResponse = {
    data: mockNotes,
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockUser = {
    _id: '690c31a5993c3f1303833344',
    email: 'test2@example.com',
    firstName: 'John',
    lastName: 'Doe',
    provider: 'google',
  };

  beforeEach(async () => {
    const mockNoteService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [
        {
          provide: NoteService,
          useValue: mockNoteService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          if (request.headers.authorization === 'Bearer user-token') {
            request.user = mockUser;
          } else {
            throw new UnauthorizedException('Unauthorized');
          }
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          const formattedErrors = formatErrors(errors);
          return new BadRequestException({ errors: formattedErrors });
        },
      }),
    );
    await app.init();

    noteService = moduleFixture.get(NoteService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /notes', () => {
    const dto: CreateNoteDto = {
      title: 'Test note',
      content: 'Test content',
      tags: ['technology'],
      category: 'Technology',
    };

    it('should create note successfully', async () => {
      noteService.create.mockResolvedValue(mockNotes[0]);

      const response = await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', 'Bearer user-token')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(mockNotes[0]);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer()).post('/notes').send(dto).expect(401);

      expect(noteService.create).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token is provided', async () => {
      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', 'Bearer invalid-token')
        .send(dto)
        .expect(401);
    });

    it('should return 400 when invalid DTO is provided', async () => {
      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', 'Bearer user-token')
        .send({ title: null, content: null })
        .expect(400);

      expect(noteService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /notes', () => {
    const query: FilterNoteDto = {
      page: 1,
      limit: 10,
      category: undefined,
      tags: undefined,
    };

    it('should return paginated note list', async () => {
      noteService.findAll.mockResolvedValue(mockPaginatedResponse);

      const response = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', 'Bearer user-token')
        .query(query)
        .expect(200);

      expect(response.body).toEqual(mockPaginatedResponse);
      expect(noteService.findAll).toHaveBeenCalledWith(query, mockUser._id);
    });

    it('should return empty list when no notes exist', async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      noteService.findAll.mockResolvedValue(emptyResponse);

      const response = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', 'Bearer user-token')
        .query(query)
        .expect(200);
      expect(response.body).toEqual(emptyResponse);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/notes').expect(401);

      expect(noteService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token is provided', async () => {
      await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(noteService.findAll).not.toHaveBeenCalled();
    });

    it('should handle query parameters correctly', async () => {
      const newQuery: FilterNoteDto = {
        page: 2,
        limit: 5,
        category: undefined,
        tags: undefined,
      };

      noteService.findAll.mockResolvedValue({
        ...mockPaginatedResponse,
        page: 2,
        limit: 5,
      });

      await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', 'Bearer user-token')
        .query(newQuery)
        .expect(200);

      expect(noteService.findAll).toHaveBeenCalledWith(newQuery, mockUser._id);
    });
  });

  describe('GET /notes/:noteId', () => {
    const mockNoteId = '690c13c0f8109709d23a4c5d';

    it('should return a single note', async () => {
      noteService.findOne.mockResolvedValue(mockNotes[0]);

      const response = await request(app.getHttpServer())
        .get(`/notes/${mockNoteId}`)
        .set('Authorization', 'Bearer user-token')
        .expect(200);

      expect(response.body).toEqual(mockNotes[0]);
      expect(noteService.findOne).toHaveBeenCalledWith(
        mockNoteId,
        mockUser._id,
      );
    });

    it('should throw 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .get(`/notes/invalid-id`)
        .set('Authorization', 'Bearer user-token')
        .expect(400);

      expect(noteService.findOne).not.toHaveBeenCalled();
    });

    it('should throw 404 if note not found', async () => {
      noteService.findOne.mockRejectedValue(
        new NotFoundException('Note not found'),
      );

      await request(app.getHttpServer())
        .get(`/notes/690c13c0f8109709d23a4c5b`)
        .set('Authorization', 'Bearer user-token')
        .expect(404);
    });
  });

  describe('PUT /notes/:noteId', () => {
    const mockNoteId = '690c13c0f8109709d23a4c5d';

    const updateDto: UpdateNoteDto = {
      title: 'Update note',
      content: 'Update content',
      tags: ['technology'],
      category: 'Technology',
    };

    const updatedNote: any = {
      ...mockNotes[0],
      ...updateDto,
    };

    it('should update note successfully', async () => {
      noteService.update.mockResolvedValue(updatedNote);

      const response = await request(app.getHttpServer())
        .put(`/notes/${mockNoteId}`)
        .set('Authorization', 'Bearer user-token')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(updatedNote);
      expect(noteService.update).toHaveBeenCalledWith(
        mockNoteId,
        updateDto,
        mockUser._id,
      );
    });

    it('should throw 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .put(`/notes/invalid-id`)
        .set('Authorization', 'Bearer user-token')
        .expect(400);

      expect(noteService.findOne).not.toHaveBeenCalled();
    });

    it('should throw 404 if note not found', async () => {
      noteService.update.mockRejectedValue(
        new NotFoundException('Note not found'),
      );

      await request(app.getHttpServer())
        .put(`/notes/690c13c0f8109709d23a4c5b`)
        .set('Authorization', 'Bearer user-token')
        .send(updateDto)
        .expect(404);
    });

    it('should throw 403 if user tries to modify a note they do not own', async () => {
      noteService.update.mockRejectedValue(
        new ForbiddenException('User not allowed to modify this note'),
      );

      await request(app.getHttpServer())
        .put(`/notes/${mockNoteId}`)
        .set('Authorization', 'Bearer user-token')
        .send(updateDto)
        .expect(403);
    });

    it('should return 400 when invalid DTO is provided', async () => {
      await request(app.getHttpServer())
        .put(`/notes/${mockNoteId}`)
        .set('Authorization', 'Bearer user-token')
        .send({ title: null, content: 2 })
        .expect(400);

      expect(noteService.update).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .put(`/notes/${mockNoteId}`)
        .set('Authorization', 'Bearer user-token')
        .send({})
        .expect(400);

      expect(noteService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /notes/:noteId', () => {
    const mockNoteId = '690c13c0f8109709d23a4c5d';

    it('should delete note successfully', async () => {
      noteService.remove.mockResolvedValue(mockNotes[0]);

      const response = await request(app.getHttpServer())
        .delete(`/notes/${mockNoteId}`)
        .set('Authorization', 'Bearer user-token')
        .expect(200);

      expect(response.body).toEqual(mockNotes[0]);
      expect(noteService.remove).toHaveBeenCalledWith(mockNoteId, mockUser._id);
    });

    it('should throw 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .delete(`/notes/invalid-id`)
        .set('Authorization', 'Bearer user-token')
        .expect(400);

      expect(noteService.remove).not.toHaveBeenCalled();
    });

    it('should throw 404 if note not found', async () => {
      noteService.remove.mockRejectedValue(
        new NotFoundException('Note not found'),
      );

      await request(app.getHttpServer())
        .delete(`/notes/690c13c0f8109709d23a4c5b`)
        .set('Authorization', 'Bearer user-token')
        .expect(404);
    });

    it('should throw 403 if user tries to delete a note they do not own', async () => {
      noteService.remove.mockRejectedValue(
        new ForbiddenException('User not allowed to delete this note'),
      );

      await request(app.getHttpServer())
        .delete(`/notes/${mockNoteId}`)
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });
  });
});
