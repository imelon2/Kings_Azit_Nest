import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomsDto } from './dto/room.create.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

// @UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
    constructor(
        private roomsService : RoomsService,
        private jwtService: JwtService
        ) { }

    @Get('generate')
    generate() {
        const payload = { test: 'test' };
        return this.jwtService.sign(payload);
    }

    @Get('test')
    test() {
        return 'success';
    }


    @Post('createRoom')
    createRoom(@Body() data : Omit<CreateRoomsDto,'roomId'>) {
        return this.roomsService.createRoom(data)
    }

    @Post('enterRoom')
    enterRoom(@Body() data: {roomId:string,user:string}) {
        return this.roomsService.enterRoom(data.roomId,data.user)
    }
}
