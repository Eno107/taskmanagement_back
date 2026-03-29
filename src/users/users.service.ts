import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  /**
   * Create a new user
   * @param data - The data for the user
   * @returns The created user
   * @throws {ConflictException} if the user already exists
   */
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

  /**
   * Get a user by their Clerk ID
   * @param clerkId - The Clerk ID of the user
   * @returns The user
   */
  async getUserByClerkId(clerkId: string) {
    return this.usersRepository.findByClerkId(clerkId);
  }
}
