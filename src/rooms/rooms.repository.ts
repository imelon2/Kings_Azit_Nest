import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Member } from "src/entities/Member";
import { Tournament } from "src/entities/Tournament";
import { Repository } from "typeorm";

@Injectable()
export class RoomsRepository {
    @InjectRepository(Member)
    private memberRepository: Repository<Member>
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>
    constructor() {}

    async testDB() {
        const result = await this.memberRepository.find({where:{memberId:"admin"}})
        return result
    }

    async getRoomInfoById(roomId: string) {
        return await this.tournamentRepository.findOne({ where: { roomId } })
    }

    async createRoom(data: Tournament) {
        return await this.tournamentRepository.save(data);
    }

    async getTimerInfo(roomId: string) {
        try {
            const {timer,blindTime} = await this.tournamentRepository.findOne({ where: { roomId } })
            return {
                duration : blindTime,
                remainedTime : timer
            }
        } catch (error) {
            throw new HttpException(error, 401);
        }
    }

    async updateBlindLevel(roomId: string) {
        try {
            await this.tournamentRepository.update({roomId},{currentBlindLevel: () => 'currentBlindLevel + 1'})
            const {currentBlindLevel,blind} = await this.getRoomInfoById(roomId)
            return {
                currentBlindLevel,
                currentBlind:blind[currentBlindLevel-1]
            }
        } catch (error) {
            throw new HttpException(error, 401);
        }
    }

    async updateRoomState(roomId: string, state:string) {
        try {
            await this.tournamentRepository.update({roomId},{state})
            return {state}
        } catch (error) {
            throw new HttpException(error, 401);
        }
    }

    async updateTimerState(roomId: string, timer:number) {
        try {
            await this.tournamentRepository.update({roomId},{timer})
            return {timer}
        } catch (error) {
            throw new HttpException(error, 401);
        }
    }
}