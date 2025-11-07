import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string> {
  constructor(private readonly errorMessage = 'Invalid ID') {}

  transform(value: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(this.errorMessage);
    }
    return value;
  }
}
