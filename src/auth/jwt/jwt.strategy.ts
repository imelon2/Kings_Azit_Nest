import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { Payload } from './jwt.payload'; // dto


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  // Guard 호출 시, 실행되는 함수
  async validate(payload) {
    try {
        console.log(payload);
        
        if (true) {
          return payload; // request.user
        } else {
          throw new UnauthorizedException('접근 오류');
        }
        
    } catch (error) {
        console.log(error);
        
    }
  }
}