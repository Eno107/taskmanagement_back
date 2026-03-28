import { Injectable } from '@nestjs/common';
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
    return this.usersRepository.create(data);
  }
}
