import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from './../src/user/user.controller';
import { UserService } from './../src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './../src/common/guards';
import { Role } from './../src/common/conts';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: jest.Mocked<UserService>;

  const mockUsers: any = [
    {
      _id: '690c31a5993c3f1303833344',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/avatar.png',
      provider: 'google',
      role: 'user',
      createdAt: '2025-11-06T05:27:01.172Z',
      updatedAt: '2025-11-06T05:27:01.172Z',
      __v: 0,
    },
    {
      _id: '690c31a5993c3f1303833344',
      email: 'test2@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      picture: 'https://example.com/avatar2.png',
      provider: 'google',
      role: 'user',
      createdAt: '2025-11-06T05:27:01.172Z',
      updatedAt: '2025-11-06T05:27:01.172Z',
      __v: 0,
    },
  ];

  const mockPaginatedResponse = {
    data: mockUsers,
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockAdminUser = {
    id: '690c31a5993c3f1303833344',
    email: 'test@example.com',
    role: Role.Admin,
  };

  const mockRegularUser = {
    id: '690c31a5993c3f1303833344',
    email: 'test2@example.com',
    role: Role.User,
  };

  beforeEach(async () => {
    const mockUserService = {
      findAll: jest.fn(),
      assignRole: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          if (request.headers.authorization === 'Bearer admin-token') {
            request.user = mockAdminUser;
          } else if (request.headers.authorization === 'Bearer user-token') {
            request.user = mockRegularUser;
          } else {
            throw new UnauthorizedException('Unauthorized');
          }
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          const requiredRoles = Reflect.getMetadata(
            'roles',
            context.getHandler(),
          );
          const user = request.user;

          if (!requiredRoles) {
            return true;
          }

          return requiredRoles.some((role) => user?.role === role);
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    userService = moduleFixture.get(UserService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return paginated users list for admin', async () => {
      userService.findAll.mockResolvedValue(mockPaginatedResponse);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer admin-token')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toEqual(mockPaginatedResponse);
      expect(userService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should return empty list when no users exist', async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      userService.findAll.mockResolvedValue(emptyResponse);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toEqual(emptyResponse);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);

      expect(userService.findAll).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token is provided', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(userService.findAll).not.toHaveBeenCalled();
    });

    it('should return 403 when non-admin user tries to access', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      expect(userService.findAll).not.toHaveBeenCalled();
    });

    it('should handle query parameters correctly', async () => {
      userService.findAll.mockResolvedValue({
        ...mockPaginatedResponse,
        page: 2,
        limit: 5,
      });

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer admin-token')
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(userService.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
      });
    });
  });

  describe('PATCH /users', () => {
    const assignRoleDto = {
      userId: '690c31a5993c3f1303833344',
      role: Role.Admin,
    };

    const updatedUser: any = {
      _id: '690c31a5993c3f1303833344',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/avatar.png',
      provider: 'google',
      role: 'user',
      createdAt: '2025-11-06T05:27:01.172Z',
      updatedAt: '2025-11-06T05:27:01.172Z',
      __v: 0,
    };

    it('should assign role to user successfully', async () => {
      userService.assignRole.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', 'Bearer admin-token')
        .send(assignRoleDto)
        .expect(200);

      expect(response.body).toEqual(updatedUser);
      expect(userService.assignRole).toHaveBeenCalledWith(assignRoleDto);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .patch('/users')
        .send(assignRoleDto)
        .expect(401);

      expect(userService.assignRole).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token is provided', async () => {
      await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', 'Bearer invalid-token')
        .send(assignRoleDto)
        .expect(401);

      expect(userService.assignRole).not.toHaveBeenCalled();
    });

    it('should return 403 when non-admin tries to assign role', async () => {
      await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', 'Bearer user-token')
        .send(assignRoleDto)
        .expect(403);

      expect(userService.assignRole).not.toHaveBeenCalled();
    });

    it('should return 400 when invalid DTO is provided', async () => {
      await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', 'Bearer admin-token')
        .send({ userId: 'invalid', role: 'InvalidRole' })
        .expect(400);

      expect(userService.assignRole).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', 'Bearer admin-token')
        .send({})
        .expect(400);

      expect(userService.assignRole).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      userService.assignRole.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', 'Bearer admin-token')
        .send(assignRoleDto)
        .expect(404);
    });

    it('should accept valid role values', async () => {
      const adminRoleDto = { ...assignRoleDto, role: Role.Admin };
      userService.assignRole.mockResolvedValue(updatedUser);

      await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', 'Bearer admin-token')
        .send(adminRoleDto)
        .expect(200);

      expect(userService.assignRole).toHaveBeenCalledWith(adminRoleDto);
    });
  });
});
