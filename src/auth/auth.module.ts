import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ClerkTokenGuard } from './clerk-token.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthGuard, ClerkTokenGuard],
  exports: [AuthGuard, ClerkTokenGuard],
})
export class AuthModule {}
