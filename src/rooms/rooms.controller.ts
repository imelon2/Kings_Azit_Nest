import { Body, Controller, Get, HttpException, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { Tournament } from 'src/entities/Tournament';

@UseGuards(JwtAuthGuard)
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
    test(@Req() req:any) {

        return this.roomsService.testEmit("")
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
    enterRoom(@Req() req:any,@Body() data: {roomId:string}) {
        return this.roomsService.enterRoom(data.roomId,req.user.uuid)
    }

    @Get('getGameInfoFromToday')
    getGameInfoFromToday(@Query('limit') limit:number) {
        try {
            return this.roomsService.getGameInfoFromToday(limit);
        } catch (error) {
            throw new HttpException(error, 405);
        }
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
