import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Tournament } from 'src/entities/Tournament';

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
        return this.roomsService.testEmit('room-8f34d95c-4097-4f90-ae09-81b38e5eeb47')
    }

    @Get('getRoomInfo')
    getRoomInfo(@Query('roomId') roomId:string) {
        return this.roomsService.getRoomInfo(roomId);
    }

    @Post('createRoom')
    createRoom(@Body() data : Tournament) {
        return this.roomsService.createRoom(data)
    }

    @Post('enterRoom')
    enterRoom(@Body() data: {roomId:string,user:string}) {
        return this.roomsService.enterRoom(data.roomId,data.user)
    }

    @Post('startGame')
    startGame(@Body() data: {roomId:string}) {
        try {
            return this.roomsService.startGame(data.roomId)
        } catch (error) {
            return error
        }
    }

    @Post('restartGame')
    restartGame(@Body() data: {roomId:string}) {
        return this.roomsService.restartGame(data.roomId)
    }

    @Post('breakGame')
    breakGame(@Body() data: {roomId:string}) {
        return this.roomsService.breakGame(data.roomId)
    }
}
