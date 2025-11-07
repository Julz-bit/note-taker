import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Types } from 'mongoose';
import { AssignRoleDto } from './dto';
import { Role } from '../common/conts';

const mockUsers = [
  {
    _id: new Types.ObjectId('690c31a5993c3f1303833344'),
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    picture: 'https://example.com/avatar.png',
    provider: 'google',
    role: 'user',
    createdAt: new Date('2025-11-06T05:27:01.172Z'),
    updatedAt: new Date('2025-11-06T05:27:01.172Z'),
    save: jest.fn(),
  },
  {
    _id: new Types.ObjectId('690c31a5993c3f1303833347'),
    email: 'test2@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    picture: 'https://example.com/avatar1.png',
    provider: 'google',
    role: 'user',
    createdAt: new Date('2025-11-06T05:27:01.172Z'),
    updatedAt: new Date('2025-11-06T05:27:01.172Z'),
    save: jest.fn(),
  },
];

const mockPaginatedUsers = {
  data: mockUsers,
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockPaginatedUsers),
            assignRole: jest
              .fn()
              .mockImplementation((assignRoleDto: AssignRoleDto) =>
                Promise.resolve({ ...mockUsers[0], role: assignRoleDto.role }),
              ),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should retrieve paginated users', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedUsers);
    });
  });

  describe('assignRole()', () => {
    it('should assign new role successfully', async () => {
      const assignRoleDto: AssignRoleDto = {
        userId: '690c31a5993c3f1303833344',
        role: Role.Admin,
      };

      const result = await controller.assignRole(assignRoleDto);

      expect(result).toEqual({
        ...mockUsers[0],
        role: assignRoleDto.role,
      });
    });
  });
});
