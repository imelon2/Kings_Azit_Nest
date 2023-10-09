import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { EventsModule } from 'src/events/events.module';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports:[EventsModule,AuthModule],
  providers: [RoomsService],
  controllers: [RoomsController]
})
export class RoomsModule {}
