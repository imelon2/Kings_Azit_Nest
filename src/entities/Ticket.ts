import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./Member";

@Entity("ticket", { schema: "genesis" })
export class Ticket {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ticket_id" })
  ticketId: string;

  @Column("int", { name: "black" })
  black: number;

  @Column("int", { name: "gold" })
  gold: number;

  @Column("int", { name: "red" })
  red: number;

  @OneToOne(() => Member, (member) => member.ticket)
  member: Member;
}
