import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("ticket_history", { schema: "genesis" })
export class TicketHistory {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "uuid", length: 255 })
  uuid: string;

  @Column("varchar", { name: "type", length: 45 })
  type: string;

  @Column("varchar", { name: "summary", length: 255 })
  summary: string;

  @Column("int", { name: "amount" })
  amount: number;

  @Column("varchar", { name: "date", length: 45 })
  date: string;

  @Column("varchar", { name: "flag", nullable: true, length: 45 })
  flag: string | null;
}
