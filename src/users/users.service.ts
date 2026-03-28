import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(data: {
    clerkId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) {
    const existingUser = await this.usersRepository.findByClerkId(data.clerkId);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    return this.usersRepository.create(data);
  }
}
