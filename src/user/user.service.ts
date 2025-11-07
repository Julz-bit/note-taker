import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas';
import { Model, Types } from 'mongoose';
import { PaginateDto } from 'src/common/dtos';
import { PaginatedResult } from 'src/common/types';
import { AssignRoleDto } from './dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findOrCreate(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    provider: string;
  }): Promise<User> {
    const exists = await this.findByEmail(googleUser.email);

    if (exists) {
      return exists;
    }

    return await this.userModel.create(googleUser);
  }

  async findById(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const user = await this.userModel.findOne({ _id: id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(query: PaginateDto): Promise<PaginatedResult<User>> {
    const { page, limit } = query;

    const results = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await this.userModel.countDocuments();

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<User> {
    const { userId, role } = assignRoleDto;
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userModel.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    user.role = role;
    await user.save();

    return user;
  }
}
