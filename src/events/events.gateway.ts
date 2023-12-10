import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { liveRooms, rooms } from './rooms';
import { SocketGuard } from 'src/auth/jwt/jwt.socketGuard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ namespace: /\/room-+/ })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private jwtService: JwtService) {}

  @WebSocketServer() public server: Server;

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    console.log('test', data);
  }

  afterInit(server: Server) {
    console.log('init');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      console.log('handle connected');
      await SocketGuard.verifyToken(this.jwtService, socket);

      const roomId = socket.nsp.name.substring(1);
      socket.join(roomId)
      console.log("[handleConnection] join roomId : "+roomId);
    } catch (error) {
      if (error.response.error === 'Unauthorized') {
        socket.emit('disconnected', 'JsonWebTokenError: invalid token');
        socket.disconnect();
      }
      console.log(error);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnected', socket.nsp.name);
    const roomId = socket.nsp.name.substring(1);
    socket.leave(roomId);
    console.log("[disconnected] leave roomId : "+roomId);
  }

  @SubscribeMessage('GetRoomInfo')
  handleGetRoomInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    socket.emit("RoomInfo-"+roomId, rooms[roomId]);
    socket.emit("TablePlayers-"+roomId, liveRooms[roomId]);
    // newNamespace.emit('onlineList', Object.values(rooms[socket.nsp.name]));
    // socket.join(socket.nsp.name)
    // data.channels.forEach((channel) => {
    //   console.log('join', socket.nsp.name, channel);
    //   socket.join(`${socket.nsp.name}-${channel}`);
    // });
  }

  @SubscribeMessage('GetRoomTableInfo')
  handleGetRoomLiveInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    const {gameState ,latestTimer,blindLevel,blindTime,blind} = rooms[roomId]
    const TableInfo = {
      gameState,
      blindLevel,
      currentBlind : blind[blindLevel],
      nextBlind : blind[blindLevel+1],
    }
    
    socket.emit("TableInfo-"+roomId, TableInfo);
  }
}
