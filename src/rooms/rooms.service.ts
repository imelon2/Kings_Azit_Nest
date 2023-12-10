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

  async testEmit(uuid: string) {
    return this.roomsRepository.getCurrentPlayersNicknameByRoomId(
      'room-8f34d95c-4097-4f90-ae09-81b38e5eeb47',
    );
    // return await this.roomsRepository.addPlayerToTournament("room-3f71ff05-1299-4644-9254-2033de2a86f9",uuid)
    // return await this.roomsRepository.createTicketHistory({
    //   uuid,
    //   type: 'black',
    //   summary: 'room-8f34d95c-4097-4f90-ae09-81b38e5eeb47',
    //   amount: -3,
    //   flag: 'game',
    // });
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
      data.currentPlayers = [];
      const result = await this.roomsRepository.createRoom(data);
      return { result };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getRoomInfo(roomId: string) {
    const result = await this.roomsRepository.getRoomInfoById(roomId);
    const current_players =
      await this.roomsRepository.getCurrentPlayersNicknameByRoomId(roomId);
    result.currentPlayers = current_players;
    return result;
  }

  async getGameInfoFromToday(limit: number) {
    return this.roomsRepository.getGameInfoFromToday(limit);
  }

  async enterRoom(roomId: string, uuid: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const { ticketType, ticketAmount, entry, currentEntrys } =
        await this.roomsRepository.getRoomInfoById(roomId);

      // 최대 Entry 도달
      if (currentEntrys >= entry && entry !== 0) {
        throw new HttpException(`Current Entry Max Up`, 401);
      }

      const currentTicket = await this.roomsRepository.getTicketByUUID(uuid);

      // 사용자 티켓 부족 시, Error return
      if (currentTicket[ticketType] < ticketAmount) {
        throw new HttpException(`Not Enough ${ticketType} Ticket Balace`, 401);
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();
      const decreaseTicektBalanceResult =
        await this.roomsRepository.decreaseTicektBalance(
          currentTicket.ticketId,
          ticketType,
          ticketAmount,
          queryRunner,
        );

      // Ticekt Balance Update가 안된 경우
      if (decreaseTicektBalanceResult.affected === 0) {
        throw new HttpException(
          `Invalid User Can Decrease Ticket Balance`,
          401,
        );
      }

      // 티켓 사용 내역 저장
      await this.roomsRepository.createTicketHistory({
        uuid,
        type: ticketType,
        summary: roomId,
        amount: -ticketAmount,
        flag: 'game',
      });

      // 토너먼트 방 입장
      await this.roomsRepository.addPlayerAntEntryToTournament(
        roomId,
        uuid,
        queryRunner,
      );
      await queryRunner.commitTransaction();

      // @TODO Socket
      const current_players = await this.roomsRepository.getCurrentPlayersNicknameByRoomId(roomId)
      this.eventsGateway.server.to(roomId).emit('current_players', current_players);
      this.eventsGateway.server.to(roomId).emit('current_entrys', currentEntrys+1);

      return 'Success EnterRoom';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new HttpException(error, 400);
    } finally {
      await queryRunner.release();
    }
  }

  async startGame(roomId: string) {
    try {
      const { state, timer, blindTime } =
        await this.roomsRepository.getRoomInfoById(roomId);
      if (!state) {
        throw new HttpException('Non-existent rooms', 405);
      }
      // startGame은 gameState가 wait때만 가능하다.
      if (state !== 'wait') {
        throw new HttpException('Game has already started', 400);
      }

      RoomTimer[roomId] = this.#_runner(roomId, blindTime, timer);
      RoomTimer[roomId].run();
      // Change Game State = start
      await this.roomsRepository.updateRoomState(roomId, 'start');
      this.eventsGateway.server.to(roomId).emit('state', 'start');
      return 'START GAME';
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 400);
    }
  }

  async restartGame(roomId: string) {
    try {
      const { state, timer, blindTime } =
        await this.roomsRepository.getRoomInfoById(roomId);
      if (!state) {
        throw new HttpException('Non-existent rooms', 405);
      }
      // startGame은 gameState가 wait때만 가능하다.
      if (state !== 'break') {
        throw new HttpException('Game is not in break', 400);
      }

      // Server Restart 시, #_runner 이벤트 유실된 경우
      if (!RoomTimer[roomId]) {
        RoomTimer[roomId] = this.#_runner(roomId, blindTime, timer);
      }
      RoomTimer[roomId].run();
      // Change Game State = start
      await this.roomsRepository.updateRoomState(roomId, 'restart');
      this.eventsGateway.server.to(roomId).emit('state', 'restart');
      return 'RESTART GAME';
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 400);
    }
  }

  async breakGame(roomId: string) {
    try {
      const { state } = await this.roomsRepository.getRoomInfoById(roomId);
      if (!state) {
        throw new HttpException('Non-existent rooms', 405);
      }
      // breakGame gameState가 start때만 가능하다.
      if (!(state == 'restart' || state == 'start')) {
        throw new HttpException('Game is not in progress', 405);
      }

      // this.#_pause(roomId);
      await RoomTimer[roomId].pause();
      // Change Game State = break
      await this.roomsRepository.updateRoomState(roomId, 'break');
      this.eventsGateway.server.to(roomId).emit('state', 'break');
      return 'BREAK GAME';
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 400);
    }
  }

  #_runner(roomId: string, duration: number, remainedTime: number) {
    // Run Timer
    let min = 0;
    let sec = 0;
    let time = remainedTime !== 0 ? remainedTime : duration * 60 - 1;
    let _timer;
    const run = () => {
      _timer = setInterval(async () => {
        min = Math.floor(time / 60);
        sec = time % 60;

        this.eventsGateway.server
          .to(roomId)
          .emit('timer', min + ':' + sec.toString().padStart(2, '0'));
        // console.log(min + ':' + sec.toString().padStart(2, '0'));
        time--;

        // END Timer
        if (time < 0) {
          // reset time
          time = 60 * duration - 1;
          const { blind, currentBlindLevel } =
            await this.roomsRepository.updateBlindLevel(roomId);
          const sendBlind = {
            currentBlindLevel,
            currentBlind:
              blind[currentBlindLevel - 1] === undefined
                ? null
                : blind[currentBlindLevel - 1],
            nextBlind:
              blind[currentBlindLevel] === undefined
                ? null
                : blind[currentBlindLevel],
          };

          if (sendBlind.currentBlind == null) {
            await this.#_deleteTimer(roomId);
            return;
          }

          this.eventsGateway.server.to(roomId).emit('blind', {
            currentBlindLevel,
            currentBlind: blind[currentBlindLevel - 1],
            nextBlind: blind[currentBlindLevel],
          });
        }
      }, 1000);
    };

    const pause = async () => {
      await this.roomsRepository.updateTimerState(roomId, time);
      clearInterval(_timer);
    };

    return { run, pause };
  }

  async #_deleteTimer(roomId: string) {
    RoomTimer[roomId].pause();
    delete RoomTimer[roomId];

    await this.roomsRepository.updateRoomState(roomId, 'end');
    this.eventsGateway.server.to(roomId).emit('state', 'end');
    this.eventsGateway.server.to(roomId).emit('timer', 'End');
  }
}
