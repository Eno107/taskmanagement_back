import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { JwtPayload } from '@clerk/express/types';
import { User } from '@prisma/client';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    let verifiedToken: JwtPayload;

    try {
      verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!verifiedToken.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    // Verify User exists in the database
    const user: User | null = await this.usersService.getUserByClerkId(
      verifiedToken.sub,
    );

    if (!user) {
      throw new UnauthorizedException('User not found in database');
    }

    request['user'] = user;
    return true;
  }
}
