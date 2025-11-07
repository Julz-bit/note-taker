import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Types } from 'mongoose';
import { User } from './schemas';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockUser = {
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
};

describe('UserService', () => {
  let service: UserService;
  let userModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreate', () => {
    it('should return existing user if found', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOrCreate(mockUser);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
      expect(result).toEqual(mockUser);
    });

    it('should create new user if not found', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      userModel.create.mockResolvedValue(mockUser);

      const result = await service.findOrCreate(mockUser);

      expect(userModel.create).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(service.findById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findById(mockUser._id.toString())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user if found', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.findById(mockUser._id.toString());

      expect(userModel.findOne).toHaveBeenCalledWith({
        _id: mockUser._id.toString(),
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should retrun paginated users', async () => {
      const query = { page: 1, limit: 10 };
      const mockResults = [
        mockUser,
        { ...mockUser, _id: new Types.ObjectId() },
      ];

      const mockExecChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockResults),
      };

      userModel.find = jest.fn().mockReturnValue(mockExecChain);
      userModel.countDocuments = jest.fn().mockResolvedValue(2);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: mockResults,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('assignRole', () => {
    it('should throw BadRequestException for invalid ID format', async () => {
      await expect(
        service.assignRole({ userId: 'invalid-id', role: 'admin' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user does not exists', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(
        service.assignRole({ userId: mockUser._id.toString(), role: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should assign new role successfully', async () => {
      const updatedUser = { ...mockUser, role: 'admin' };
      userModel.findById.mockResolvedValue(mockUser);
      mockUser.save.mockResolvedValue(updatedUser);

      const result = await service.assignRole({
        userId: mockUser._id.toString(),
        role: 'admin',
      });

      expect(userModel.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.role).toBe('admin');
    });
  });
});
