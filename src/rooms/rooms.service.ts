import { HttpException, Injectable } from '@nestjs/common';
import { RoomTimer } from 'src/events/rooms';
import { EventsGateway } from 'src/events/events.gateway';
import { v4 as uuidv4 } from 'uuid';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/entities/Member';
import { Tournament } from 'src/entities/Tournament';
import { RoomsRepository } from './rooms.repository';

@Injectable()
export class RoomsService {
  @InjectRepository(Member)
  private memberRepository: Repository<Member>;
  @InjectRepository(Tournament)
  private tournamentRepository: Repository<Tournament>;
  constructor(
    private readonly eventsGateway: EventsGateway,
    private dataSource: DataSource,
    private readonly roomsRepository: RoomsRepository,
  ) {}

  async testEmit(roomId: string) {
    // const result = this.roomsRepository.testDB()
    const result = this.roomsRepository.updateBlindLevel(roomId)
    return result;
  }

  /**
   * @summary 토너먼트 생성 API
   * @param data Tournament
   * @returns 저장된 결과 값
   */
  async createRoom(data: Tournament) {
    try {
      const roomId = uuidv4();
      data.roomId = `room-${roomId}`;
      data.regEndDate = new Date(Number(data.regEndDate)).toISOString();
      data.startDate = new Date(Number(data.startDate)).toISOString();
      const result = await this.roomsRepository.createRoom(data)
      return { result };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getRoomInfo(roomId: string) {
    return this.roomsRepository.getRoomInfoById(roomId)
  }

  async enterRoom(roomId: string, user: string) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();
    } catch (error) {
      console.log(error);
    }
    return 'Success enterRoom';
  }

  async startGame(roomId: string) {
    try {
      const {state,timer,blindTime} = await this.roomsRepository.getRoomInfoById(roomId)
      if(!state) {
        throw new HttpException("Non-existent rooms",405)
      }
      // startGame은 gameState가 wait때만 가능하다.
      if(state !== 'wait') {
        throw new HttpException("Game has already started",400)
      }
      
      RoomTimer[roomId] = this.#_runner(roomId,blindTime,timer);
      RoomTimer[roomId].run()
      // Change Game State = start
      await this.roomsRepository.updateRoomState(roomId,"start");
      this.eventsGateway.server.to(roomId).emit("state","start")
      return 'START GAME';
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 400);
    }
  }

  async restartGame(roomId: string) {
    try {
      const {state} = await this.roomsRepository.getRoomInfoById(roomId)
      if(!state) {
        throw new HttpException("Non-existent rooms",405)
      }
      // startGame은 gameState가 wait때만 가능하다.
      if(state !== 'break') {
        throw new HttpException("Game is not in break",400)
      }
      RoomTimer[roomId].run();
      // Change Game State = start
      await this.roomsRepository.updateRoomState(roomId,"restart");
      this.eventsGateway.server.to(roomId).emit("state","restart")
      return "RESTART GAME";
    } catch (error) {
      throw new HttpException(error,400)
    }
  }

  async breakGame(roomId: string) {
    try {
      const {state} = await this.roomsRepository.getRoomInfoById(roomId)
      if(!state) {
        throw new HttpException("Non-existent rooms",405)
      }
      // breakGame gameState가 start때만 가능하다.
      if(!(state == 'restart' || state == 'start')) {
        throw new HttpException("Game is not in progress",405)
      }

      // this.#_pause(roomId);
      await RoomTimer[roomId].pause()
      // Change Game State = break
      await this.roomsRepository.updateRoomState(roomId,"break");
      this.eventsGateway.server.to(roomId).emit("state","break")
      return 'BREAK GAME';
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 400);
    }
  }


  #_runner(roomId: string, duration:number, remainedTime:number) {
    // Run Timer
    let min = 0;
    let sec = 0;
    let time = remainedTime !== 0 ? remainedTime : duration * 60 - 1;
    let _timer;
    const run = () => {
      _timer = setInterval( async () => {
        min = Math.floor(time / 60);
        sec = time % 60;
  
        this.eventsGateway.server.to(roomId).emit("timer",min + ':' + sec.toString().padStart(2,"0"))
        console.log(min + ':' + sec.toString().padStart(2, '0'));
        time--;
  
        // END Timer
        if (time < 0) {
          // reset time
          time = 60 * duration - 1;
          const {currentBlind,currentBlindLevel} = await this.roomsRepository.updateBlindLevel(roomId)
          console.log(currentBlind,currentBlindLevel);
        }
      }, 1000);
    }

    const pause = async () => {
      await this.roomsRepository.updateTimerState(roomId,time)
      clearInterval(_timer);
    }

    return {run,pause}
  }
}
