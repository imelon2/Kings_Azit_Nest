import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Ticket } from "./Ticket";
import { MemberRoles } from "./MemberRoles";
import { UserGameHistory } from "./UserGameHistory";

@Index("uuid_UNIQUE", ["uuid"], { unique: true })
@Index("member_id_UNIQUE", ["memberId"], { unique: true })
@Index("nickname_UNIQUE", ["nickname"], { unique: true })
@Index("UK_bq60l08b60lcaj716hlfuweri", ["ticketId"], { unique: true })
@Entity("member", { schema: "genesis" })
export class Member {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("varchar", { name: "birth", nullable: true, length: 255 })
  birth: string | null;

  @Column("varchar", { name: "gender", nullable: true, length: 255 })
  gender: string | null;

  @Column("varchar", { name: "member_id", unique: true, length: 255 })
  memberId: string;

  @Column("varchar", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("varchar", { name: "nickname", unique: true, length: 255 })
  nickname: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("varchar", { name: "phone", nullable: true, length: 255 })
  phone: string | null;

  @Column("varchar", { name: "refresh_token", nullable: true, length: 255 })
  refreshToken: string | null;

  @Column("varchar", { name: "uuid", unique: true, length: 255 })
  uuid: string;

  @Column("bigint", { name: "ticket_id", nullable: true, unique: true })
  ticketId: string | null;

  @Column("varchar", { name: "register_date", nullable: true, length: 45 })
  registerDate: string | null;

  @Column("varchar", { name: "fcm_token", nullable: true, length: 255 })
  fcmToken: string | null;

  @OneToOne(() => Ticket, (ticket) => ticket.member, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "ticket_id", referencedColumnName: "ticketId" }])
  ticket: Ticket;

  @OneToMany(() => MemberRoles, (memberRoles) => memberRoles.member)
  memberRoles: MemberRoles[];

  @OneToMany(() => UserGameHistory, (userGameHistory) => userGameHistory.userUu)
  userGameHistories: UserGameHistory[];
}
