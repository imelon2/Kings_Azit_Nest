import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tournament", { schema: "genesis" })
export class Tournament {
  @PrimaryGeneratedColumn({ type: "int", name: "_id" })
  id: number;

  @Column("varchar", { name: "roomId", length: 45 })
  roomId: string;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("timestamp", { name: "start_date" })
  startDate: string;

  @Column("timestamp", { name: "reg_end_date" })
  regEndDate: string;

  @Column("varchar", { name: "place", nullable: true, length: 45 })
  place: string | null;

  @Column("tinyint", { name: "condition", nullable: true })
  condition: number | null;

  @Column("varchar", { name: "ticket_type", length: 45 })
  ticketType: string;

  @Column("int", { name: "ticket_amount" })
  ticketAmount: number;

  @Column("varchar", { name: "desc", nullable: true, length: 255 })
  desc: string | null;

  @Column("int", { name: "entry" })
  entry: number;

  @Column("int", { name: "tournament_prize", nullable: true })
  tournamentPrize: number | null;

  @Column("json", { name: "game_prize" })
  gamePrize: object;

  @Column("json", { name: "blind", nullable: true })
  blind: object | null;

  @Column("int", { name: "blind_time", nullable: true })
  blindTime: number | null;

  @Column("varchar", {
    name: "state",
    nullable: true,
    length: 45,
    default: () => "'start'",
  })
  state: string | null;

  @Column("json", { name: "player", nullable: true })
  player: object | null;

  @Column("int", { name: "timer", nullable: true, default: () => "'0'" })
  timer: number | null;

  @Column("json", { name: "current_players", nullable: true })
  currentPlayers: object | null;

  @Column("int", { name: "current_entrys", default: () => "'0'" })
  currentEntrys: number;

  @Column("int", {
    name: "current_blind_level",
    nullable: true,
    default: () => "'1'",
  })
  currentBlindLevel: number | null;
}
