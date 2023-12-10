import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/entities/Member';
import { Ticket } from 'src/entities/Ticket';
import { TicketHistory } from 'src/entities/TicketHistory';
import { Tournament } from 'src/entities/Tournament';
import { MoreThanOrEqual, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class RoomsRepository {
  @InjectRepository(Member)
  private memberRepository: Repository<Member>;
  @InjectRepository(Tournament)
  private tournamentRepository: Repository<Tournament>;
  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;
  @InjectRepository(TicketHistory)
  private ticketHistoryRepository: Repository<TicketHistory>;

  constructor() {}

  async testDB() {
    const result = await this.memberRepository.find({
      where: { memberId: 'admin' },
    });
    return result;
  }

  /** --------------------------------------------------------------------- */
  /** -------------------------- CREATE FUNCTION -------------------------- */
  /** --------------------------------------------------------------------- */
  async createRoom(data: Tournament) {
    return await this.tournamentRepository.save(data);
  }

  async createTicketHistory(data: TicketHistory) {
    return await this.ticketHistoryRepository.save(data);
  }

  /** --------------------------------------------------------------------- */
  /** -------------------------- READ FUNCTION -------------------------- */
  /** --------------------------------------------------------------------- */
  async getTicketByUUID(uuid: string) {
    try {
      return this.ticketRepository
        .createQueryBuilder('ticket')
        .innerJoin('ticket.member', 'member')
        .where('member.uuid = :uuid', { uuid })
        .getOne();
    } catch (error) {
      throw new HttpException(error, 401);
    }
  }

  async getRoomInfoById(roomId: string) {
    return await this.tournamentRepository.findOne({ where: { roomId } });
  }

  async getCurrentPlayersNicknameByRoomId(roomId: string) {
    const results = await this.memberRepository
      .createQueryBuilder('member')
      .select(['member.nickname', 'member.uuid'])
      .innerJoin(
        'tournament',
        'tournament',
        'JSON_SEARCH(tournament.current_players, "one", member.uuid) IS NOT NULL',
      )
      .where('tournament.roomId = :roomId', { roomId })
      .getMany();

    return results;
  }

  async getTimerInfo(roomId: string) {
    try {
      const { timer, blindTime } = await this.tournamentRepository.findOne({
        where: { roomId },
      });
      return {
        duration: blindTime,
        remainedTime: timer,
      };
    } catch (error) {
      throw new HttpException(error, 401);
    }
  }

  async getGameInfoFromToday(limit: number) {
    try {
      return await this.tournamentRepository.find({
        where: {
          startDate: MoreThanOrEqual(new Date().toISOString().split('T')[0]),
        },
        take: limit,
      });
    } catch (error) {
      throw new HttpException(error, 401);
    }
  }

  /** --------------------------------------------------------------------- */
  /** -------------------------- UPDATE FUNCTION -------------------------- */
  /** --------------------------------------------------------------------- */
  async decreaseTicektBalance(
    ticketId: string,
    type: TicketType,
    amount: number,
    queryRunner: QueryRunner,
  ) {
    try {
      return await this.ticketRepository
        .createQueryBuilder(undefined, queryRunner)
        .update(Ticket)
        .set({ [type]: () => `${type} - ${amount}` })
        .where('ticket_id = :ticketId', { ticketId })
        .execute();
    } catch (error) {
      throw new HttpException(error, 401);
    }
  }

  async updateBlindLevel(roomId: string) {
    try {
      await this.tournamentRepository.update(
        { roomId },
        { currentBlindLevel: () => 'currentBlindLevel + 1' },
      );
      const { currentBlindLevel, blind } = await this.getRoomInfoById(roomId);
      return {
        currentBlindLevel,
        blind,
      };
    } catch (error) {
      throw new HttpException(error, 401);
    }
  }

  async updateRoomState(roomId: string, state: string) {
    try {
      await this.tournamentRepository.update({ roomId }, { state });
      return { state };
    } catch (error) {
      throw new HttpException(error, 401);
    }
  }

  async updateTimerState(roomId: string, timer: number) {
    try {
      await this.tournamentRepository.update({ roomId }, { timer });
      return { timer };
    } catch (error) {
      throw new HttpException(error, 401);
    }
  }

  async addPlayerAntEntryToTournament(
    roomId: string,
    playerUUID: string,
    queryRunner: QueryRunner,
  ) {
    return await this.tournamentRepository
      .createQueryBuilder(undefined, queryRunner)
      .update(Tournament)
      .set({
        currentPlayers: () =>
          `JSON_ARRAY_APPEND(current_players, '$', '${playerUUID}')`,
        currentEntrys: () => 'current_entrys + 1',
      })
      .where('roomId = :roomId', { roomId })
      .execute();
  }
}
