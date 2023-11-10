import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { EventsModule } from 'src/events/events.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from 'src/entities/Tournament';
import { Member } from 'src/entities/Member';
import { Ticket } from 'src/entities/Ticket';
import { MemberRoles } from 'src/entities/MemberRoles';
import { Role } from 'src/entities/Role';
import { UserGameHistory } from 'src/entities/UserGameHistory';
import { RoomsRepository } from './rooms.repository';


@Module({
  imports:[EventsModule,AuthModule,TypeOrmModule.forFeature([Tournament,Member,Ticket,MemberRoles,Role,UserGameHistory])],
  providers: [RoomsService, RoomsRepository],
  controllers: [RoomsController]
})
export class RoomsModule {}
