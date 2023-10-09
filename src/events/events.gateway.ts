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
import { rooms } from './rooms';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { SocketGuard } from 'src/auth/jwt/jwt.socketGuard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ namespace: /\/room-.+/ })
// @UseGuards(SocketGuard)
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private jwtService: JwtService) {}

  @WebSocketServer() public server: Server;

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: string,@ConnectedSocket() socket: Socket) {
    console.log('test', data);
  }
  
  @SubscribeMessage('EnterRoom')
    handleEnterRoom(
    // @MessageBody() data: { id: number; channels: number[] },
    @ConnectedSocket() socket: Socket,
  ) {
    const newNamespace = socket.nsp;
    console.log(socket.nsp.name);


    // rooms[socket.nsp.name][socket.id] = data.id;
    // this.server..send('hello')
    newNamespace.emit('onlineList', "is?");
    // newNamespace.emit('onlineList', Object.values(rooms[socket.nsp.name])); 
    socket.join(socket.nsp.name)
    // data.channels.forEach((channel) => {
    //   console.log('join', socket.nsp.name, channel);
    //   socket.join(`${socket.nsp.name}-${channel}`);
    // });
  }

  afterInit(server: Server) {
    console.log('init');
    rooms['/room-123'] = [{ id: '원혁' }, { id: '진기' }, { id: '태우' }];
  }


  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      console.log('handle connected', socket.nsp.name);
      const auth = await SocketGuard.verifyToken(
        this.jwtService,
        socket,
      );
      console.log("auth",auth);
      
      // if (!rooms[socket.nsp.name]) {
      //   rooms[socket.nsp.name] = {};
      // }
  
      socket.emit('hello', socket.nsp.name);
    } catch (error) {
      if(error.response.error === 'Unauthorized') {
        socket.emit('disconnected',"JsonWebTokenError: invalid token")
        socket.disconnect()
      }
      // console.log(error);
      
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnected', socket.nsp.name);
    // const newNamespace = socket.nsp;
    // delete rooms[socket.nsp.name][socket.id];
    // newNamespace.emit('onlioneList', Object.values(rooms[socket.nsp.name]));
  }
}
