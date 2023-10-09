import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Socket } from 'socket.io';
import { JwtService } from "@nestjs/jwt";

export class SocketGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
    async canActivate(context: ExecutionContext) : Promise<boolean> {
        const client = context.switchToWs().getClient();
        return await SocketGuard.verifyToken(
            this.jwtService,
            client,
          );
    }

    static async verifyToken(
        jwtService:JwtService,
        socket: Socket,
      ) {
        try {
          const token = socket.handshake.auth.token.replace('Bearer ',"")
          const result = await jwtService.verify(token)
          return !!result;
        } catch (error) {
          throw new UnauthorizedException("JsonWebTokenError: invalid token");
          
        }
        // if (!token) return false;
        
        // socket.conn.token = token;
        // const { sub } = await jwtService.decode(token);
        // socket.conn.userId = sub;
        // console.log(`Setting connection userId to "${sub}"`);
      }
}