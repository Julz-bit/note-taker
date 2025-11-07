import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Role } from '../common/conts';

const mockReq: any = {
  user: {
    _id: '690bfdd72ebb06608874d365',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocJHxM',
    provider: 'google',
    createdAt: new Date('2025-11-06T01:45:59.953Z'),
    updatedAt: new Date('2025-11-06T06:23:35.244Z'),
    __v: 0,
    role: Role.Admin,
  },
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuthRedirect', () => {
    it('should return a success message with user data', async () => {
      const result = await controller.googleAuthRedirect(mockReq);
      expect(result).toEqual({
        message: 'Login successful',
        ...mockReq.user,
      });
    });
  });

  describe('getProfile', () => {
    it('should return the authenticated user profile', () => {
      const result = controller.getProfile(mockReq);
      expect(result).toEqual(mockReq.user);
    });
  });
});
