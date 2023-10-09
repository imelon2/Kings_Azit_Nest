import { HttpException, Injectable } from '@nestjs/common';
import { CreateRoomsDto } from './dto/room.create.dto';
import { rooms } from 'src/events/rooms';
import { EventsGateway } from 'src/events/events.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomsService {
  constructor(private readonly eventsGateway: EventsGateway) {}

  createRoom(data: Omit<CreateRoomsDto, 'roomId'>) {
    // const room: CreateRoomsDto = { ...data, roomId: uuidv4() };
    const roomId = uuidv4();
    rooms['room:'+roomId] = data;
    return {roomId};
  }

  enterRoom(roomId: string, user: string) {
    rooms[roomId].push({ id: user });
    this.eventsGateway.server
      .to(roomId)
      .emit('onlineList', Object.values(rooms[roomId]));
    return 'Success enterRoom';
  }
}
